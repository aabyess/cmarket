import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { getInvoicePdfData, type InvoiceMeta } from "@/features/chat/pdf/getInvoicePdfData";
import { InvoicePdfDocument, type InvoicePdfLabels } from "@/features/chat/pdf/InvoicePdfDocument";
import { routing } from "@/i18n/routing";

const BUCKET = "quote-documents";
const SIGNED_URL_TTL = 60 * 10;

type Locale = (typeof routing.locales)[number];
type AdminClient = Awaited<ReturnType<typeof createServerAdminClient>>;

function resolveLocale(input: unknown): Locale {
	return typeof input === "string" && (routing.locales as readonly string[]).includes(input)
		? (input as Locale)
		: routing.defaultLocale;
}

function parseInvoiceMeta(content: string | null): InvoiceMeta | undefined {
	if (!content) return undefined;
	try {
		const parsed = JSON.parse(content);
		if (
			parsed &&
			typeof parsed.invoiceNumber === "string" &&
			typeof parsed.issuedAt === "string" &&
			typeof parsed.paymentDueDate === "string"
		) {
			return parsed;
		}
		return undefined;
	} catch {
		return undefined;
	}
}

async function ensureMessageRecorded(
	admin: AdminClient,
	quoteId: string,
	senderId: string,
	storagePath: string,
	fileName: string,
	meta: InvoiceMeta,
): Promise<void> {
	const { data: existing } = await admin
		.from("messages")
		.select("id")
		.eq("quote_id", quoteId)
		.eq("message_type", "invoice_pdf")
		.limit(1)
		.maybeSingle();

	if (existing) return;

	await admin.from("messages").insert({
		quote_id: quoteId,
		sender_id: senderId,
		content: JSON.stringify(meta),
		message_type: "invoice_pdf",
		attachment_url: storagePath,
		attachment_name: fileName,
	});
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId, locale: rawLocale } = await req.json();
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

	const admin = await createServerAdminClient();

	const { data: existingMessage } = await admin
		.from("messages")
		.select("content")
		.eq("quote_id", quoteId)
		.eq("message_type", "invoice_pdf")
		.limit(1)
		.maybeSingle();

	const fixedMeta = parseInvoiceMeta(existingMessage?.content ?? null);

	const data = await getInvoicePdfData(quoteId, fixedMeta);
	if (!data) {
		return NextResponse.json({ error: "데이터를 찾을 수 없습니다." }, { status: 404 });
	}

	if (data.buyerId !== user.id && data.sellerId !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const meta: InvoiceMeta = {
		invoiceNumber: data.invoiceNumber,
		issuedAt: data.issuedAt,
		paymentDueDate: data.paymentDueDate,
	};

	const storagePath = `invoices/${quoteId}/invoice-${locale}.pdf`;
	const t = await getTranslations({ locale, namespace: "InvoicePdfDocument" });
	const fileName = `${t("fileNamePrefix")}_${data.listing.title}_${data.invoiceNumber}.pdf`;

	const { data: existingSigned } = await admin.storage.from(BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL);

	if (existingSigned) {
		await ensureMessageRecorded(admin, quoteId, user.id, storagePath, fileName, meta);
		return NextResponse.json({
			attachmentUrl: storagePath,
			attachmentName: fileName,
			signedUrl: existingSigned.signedUrl,
		});
	}

	const labels: InvoicePdfLabels = {
		title: t("title"),
		issuedLine: (date) => t("issuedLine", { date }),
		invoiceNumberLabel: (number) => t("invoiceNumberLabel", { number }),
		billToLabel: t("billToLabel"),
		billFromLabel: t("billFromLabel"),
		representativeLabel: t("representativeLabel"),
		addressLabel: t("addressLabel"),
		businessTypeItemLabel: t("businessTypeItemLabel"),
		itemsSectionTitle: t("itemsSectionTitle"),
		itemNameColumn: t("itemNameColumn"),
		itemSpecColumn: t("itemSpecColumn"),
		itemQtyColumn: t("itemQtyColumn"),
		paymentInfoSectionTitle: t("paymentInfoSectionTitle"),
		listingTitleLabel: t("listingTitleLabel"),
		deliveryDaysLabel: t("deliveryDaysLabel"),
		deliveryDaysValue: (days) => t("deliveryDaysValue", { days }),
		paymentMethodLabel: t("paymentMethodLabel"),
		paymentMethodValue: t("paymentMethodValue"),
		amountDueLabel: t("amountDueLabel"),
		paymentDueLabel: t("paymentDueLabel"),
		paymentDueValue: (date) => t("paymentDueValue", { date }),
		bankInfoTitle: t("bankInfoTitle"),
		bankNameLabel: t("bankNameLabel"),
		accountNumberLabel: t("accountNumberLabel"),
		accountHolderLabel: t("accountHolderLabel"),
		swiftCodeLabel: t("swiftCodeLabel"),
		receivingCurrencyLabel: t("receivingCurrencyLabel"),
		footer: t("footer"),
	};

	const pdfBuffer = await renderToBuffer(
		InvoicePdfDocument({
			invoiceNumber: data.invoiceNumber,
			issuedAt: data.issuedAt,
			paymentDueDate: data.paymentDueDate,
			listing: data.listing,
			quote: data.quote,
			buyerCompany: data.buyerCompany,
			sellerCompany: data.sellerCompany,
			bankAccount: data.bankAccount,
			labels,
		}),
	);

	const { error: uploadError } = await admin.storage
		.from(BUCKET)
		.upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	await ensureMessageRecorded(admin, quoteId, user.id, storagePath, fileName, meta);

	const { data: signed, error: signError } = await admin.storage
		.from(BUCKET)
		.createSignedUrl(storagePath, SIGNED_URL_TTL);

	if (signError || !signed) {
		return NextResponse.json({ error: signError?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	return NextResponse.json({
		attachmentUrl: storagePath,
		attachmentName: fileName,
		signedUrl: signed.signedUrl,
	});
}
