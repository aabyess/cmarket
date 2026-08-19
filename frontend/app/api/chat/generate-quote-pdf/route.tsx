import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/libs/supabaseServer";
import { getQuotePdfData } from "@/features/chat/pdf/getQuotePdfData";
import { QuotePdfDocument, type QuotePdfLabels } from "@/features/chat/pdf/QuotePdfDocument";
import { getCategoryLabels } from "@/features/buyer/constants";
import { countryToLocale } from "@/utils/countryToLocale";
import { routing } from "@/i18n/routing";

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
	const { data: existing } = await admin
		.from("messages")
		.select("id")
		.eq("quote_id", quoteId)
		.eq("message_type", "quote_pdf")
		.eq("attachment_url", storagePath)
		.maybeSingle();

	if (existing) return;

	await admin.from("messages").insert({
		quote_id: quoteId,
		sender_id: senderId,
		content: fileName,
		message_type: "quote_pdf",
		attachment_url: storagePath,
		attachment_name: fileName,
	});
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
): Promise<GenerateResult | { error: string }> {
	const data = await getQuotePdfData(quoteId, locale, translateItems);
	if (!data) return { error: "견적을 찾을 수 없습니다." };

	const storagePath = `${quoteId}/quote-${locale}.pdf`;

	const [t, tCategory] = await Promise.all([
		getTranslations({ locale, namespace: "QuotePdfDocument" }),
		getTranslations({ locale, namespace: "ListingCategory" }),
	]);
	const fileName = `${t("fileNamePrefix")}_${data.listing.title}.pdf`;

	const { data: existingSigned } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL);

	if (existingSigned) {
		await ensureMessageRecorded(admin, quoteId, senderId, storagePath, fileName);
		return { attachmentUrl: storagePath, attachmentName: fileName, signedUrl: existingSigned.signedUrl };
	}

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

	await ensureMessageRecorded(admin, quoteId, senderId, storagePath, fileName);

	const { data: signed, error: signError } = await admin.storage
		.from(BUCKET)
		.createSignedUrl(storagePath, SIGNED_URL_TTL);

	if (signError || !signed) return { error: signError?.message ?? "URL 생성 실패" };

	return { attachmentUrl: storagePath, attachmentName: fileName, signedUrl: signed.signedUrl };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId, locale: rawLocale, sendPair } = await req.json();
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

	const data = await getQuotePdfData(quoteId, locale);
	if (!data) {
		return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
	}

	if (data.buyerId !== user.id && data.sellerId !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const admin = createServiceRoleClient();

	// 문의하기(채팅 시작) 시점에는 바이어 언어 원본 + 셀러 언어 참고 번역본을 함께 보낸다.
	if (sendPair) {
		const { data: profiles } = await admin
			.from("profiles")
			.select("id, country")
			.in("id", [data.buyerId, data.sellerId]);
		const countryMap = new Map((profiles ?? []).map((p) => [p.id, p.country]));

		const buyerLocale = countryToLocale(countryMap.get(data.buyerId));
		const sellerLocale = countryToLocale(countryMap.get(data.sellerId));

		const original = await generateQuoteDoc(admin, quoteId, buyerLocale, user.id);
		if ("error" in original) {
			return NextResponse.json({ error: original.error }, { status: 500 });
		}

		if (sellerLocale === buyerLocale) {
			return NextResponse.json({ original, translation: null });
		}

		const translation = await generateQuoteDoc(admin, quoteId, sellerLocale, user.id, true);
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
