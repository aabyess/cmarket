import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/libs/supabaseServer";
import { getQuotePdfData, getQuotePdfMeta } from "@/features/chat/pdf/getQuotePdfData";
import { QuotePdfDocument, type QuotePdfLabels } from "@/features/chat/pdf/QuotePdfDocument";
import { getCategoryLabels } from "@/features/buyer/constants";
import { countryToLocale } from "@/utils/countryToLocale";
import { routing } from "@/i18n/routing";
import { parseJsonBody } from "@/utils/parseJsonBody";

const BUCKET = "quote-documents";
const SIGNED_URL_TTL = 60 * 10;

type Locale = (typeof routing.locales)[number];

function resolveLocale(input: unknown): Locale {
	return typeof input === "string" && (routing.locales as readonly string[]).includes(input)
		? (input as Locale)
		: routing.defaultLocale;
}

async function ensureMessageRecorded(
	admin: ReturnType<typeof createServiceRoleClient>,
	quoteId: string,
	senderId: string,
	storagePath: string,
	fileName: string,
): Promise<void> {
	// maybeSingle()은 중복 행이 이미 2개 이상이면 에러(data null)를 돌려줘서
	// "기존 메시지 없음"으로 오판해 insert를 반복하는 무한 루프가 있었다.
	// limit(1) 배열 조회로 바꾸고, 조회가 실패하면 insert하지 않는 쪽으로 실패시킨다.
	const { data: existing, error: selectError } = await admin
		.from("messages")
		.select("id")
		.eq("quote_id", quoteId)
		.eq("message_type", "quote_pdf")
		.eq("attachment_url", storagePath)
		.limit(1);

	if (selectError) {
		console.error("quote_pdf message lookup error:", selectError);
		return;
	}
	if (existing && existing.length > 0) return;

	// 동시 요청 경합으로 유니크 인덱스에 막힌 중복(23505)은 정상 상황이라 무시한다.
	const { error: insertError } = await admin.from("messages").insert({
		quote_id: quoteId,
		sender_id: senderId,
		content: fileName,
		message_type: "quote_pdf",
		attachment_url: storagePath,
		attachment_name: fileName,
	});
	if (insertError && insertError.code !== "23505") {
		console.error("quote_pdf message insert error:", insertError);
	}
}

type GenerateResult = {
	attachmentUrl: string;
	attachmentName: string;
	signedUrl: string;
};

async function generateQuoteDoc(
	admin: ReturnType<typeof createServiceRoleClient>,
	quoteId: string,
	locale: Locale,
	senderId: string,
	translateItems = false,
	// 채팅 메시지 기록은 최초 전송(sendPair) 시점에만. 뷰어(썸네일/열기) 경로에서
	// 기록까지 하면 카드 렌더링이 메시지를 낳는 되먹임 구조가 된다.
	recordMessage = false,
): Promise<GenerateResult | { error: string }> {
	const meta = await getQuotePdfMeta(quoteId, locale);
	if (!meta) return { error: "견적을 찾을 수 없습니다." };

	const storagePath = `${quoteId}/quote-${locale}.pdf`;
	const t = await getTranslations({ locale, namespace: "QuotePdfDocument" });
	const fileName = `${t("fileNamePrefix")}_${meta.title}.pdf`;

	const { data: existingSigned } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL);

	if (existingSigned) {
		if (recordMessage) {
			await ensureMessageRecorded(admin, quoteId, senderId, storagePath, fileName);
		}
		return { attachmentUrl: storagePath, attachmentName: fileName, signedUrl: existingSigned.signedUrl };
	}

	// 캐시가 없을 때만 품목 번역·회사 정보까지 포함한 전체 데이터를 모은다.
	const data = await getQuotePdfData(quoteId, locale, translateItems);
	if (!data) return { error: "견적을 찾을 수 없습니다." };

	const tCategory = await getTranslations({ locale, namespace: "ListingCategory" });

	const labels: QuotePdfLabels = {
		title: t("title"),
		issuedLine: (date) => t("issuedLine", { date }),
		buyerCompanyLabel: t("buyerCompanyLabel"),
		sellerCompanyLabel: t("sellerCompanyLabel"),
		representativeLabel: t("representativeLabel"),
		addressLabel: t("addressLabel"),
		businessTypeItemLabel: t("businessTypeItemLabel"),
		npwpLabel: t("npwpLabel"),
		businessNumberLabel: t("businessNumberLabel"),
		listingInfoSectionTitle: t("listingInfoSectionTitle"),
		listingTitleLabel: t("listingTitleLabel"),
		categoryLabel: t("categoryLabel"),
		deadlineLabel: t("deadlineLabel"),
		deliveryAddressLabel: t("deliveryAddressLabel"),
		itemsSectionTitle: t("itemsSectionTitle"),
		itemNameColumn: t("itemNameColumn"),
		itemSpecColumn: t("itemSpecColumn"),
		itemQtyColumn: t("itemQtyColumn"),
		itemPriceColumn: t("itemPriceColumn"),
		itemAmountColumn: t("itemAmountColumn"),
		quoteInfoSectionTitle: t("quoteInfoSectionTitle"),
		deliveryDaysLabel: t("deliveryDaysLabel"),
		deliveryDaysValue: (days) => t("deliveryDaysValue", { days }),
		paymentTermsLabel: t("paymentTermsLabel"),
		attachmentsLabel: t("attachmentsLabel"),
		noteLabel: t("noteLabel"),
		priceLabel: t("priceLabel"),
		footer: t("footer"),
		translationDisclaimer: t("translationDisclaimer"),
	};
	const categoryLabels = getCategoryLabels(tCategory);

	const pdfBuffer = await renderToBuffer(
		<QuotePdfDocument
			listing={data.listing}
			quote={data.quote}
			buyerCompany={data.buyerCompany}
			sellerCompany={data.sellerCompany}
			labels={labels}
			categoryLabels={categoryLabels}
			isTranslationCopy={translateItems}
		/>,
	);

	const { error: uploadError } = await admin.storage
		.from(BUCKET)
		.upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

	if (uploadError) return { error: uploadError.message };

	if (recordMessage) {
		await ensureMessageRecorded(admin, quoteId, senderId, storagePath, fileName);
	}

	const { data: signed, error: signError } = await admin.storage
		.from(BUCKET)
		.createSignedUrl(storagePath, SIGNED_URL_TTL);

	if (signError || !signed) return { error: signError?.message ?? "URL 생성 실패" };

	return { attachmentUrl: storagePath, attachmentName: fileName, signedUrl: signed.signedUrl };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ quoteId?: string; locale?: unknown; sendPair?: boolean }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { quoteId, locale: rawLocale, sendPair } = body;
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}
	const locale = resolveLocale(rawLocale);

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const meta = await getQuotePdfMeta(quoteId, locale);
	if (!meta) {
		return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
	}

	if (meta.buyerId !== user.id && meta.sellerId !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const admin = createServiceRoleClient();

	// 문의하기(채팅 시작) 시점에는 바이어 언어 원본 + 셀러 언어 참고 번역본을 함께 보낸다.
	if (sendPair) {
		const { data: profiles } = await admin
			.from("profiles")
			.select("id, country")
			.in("id", [meta.buyerId, meta.sellerId]);
		const countryMap = new Map((profiles ?? []).map((p) => [p.id, p.country]));

		const buyerLocale = countryToLocale(countryMap.get(meta.buyerId));
		const sellerLocale = countryToLocale(countryMap.get(meta.sellerId));

		const original = await generateQuoteDoc(admin, quoteId, buyerLocale, user.id, false, true);
		if ("error" in original) {
			return NextResponse.json({ error: original.error }, { status: 500 });
		}

		if (sellerLocale === buyerLocale) {
			return NextResponse.json({ original, translation: null });
		}

		const translation = await generateQuoteDoc(admin, quoteId, sellerLocale, user.id, true, true);
		if ("error" in translation) {
			return NextResponse.json({ error: translation.error }, { status: 500 });
		}

		return NextResponse.json({ original, translation });
	}

	const result = await generateQuoteDoc(admin, quoteId, locale, user.id);
	if ("error" in result) {
		return NextResponse.json({ error: result.error }, { status: 500 });
	}

	return NextResponse.json(result);
}
