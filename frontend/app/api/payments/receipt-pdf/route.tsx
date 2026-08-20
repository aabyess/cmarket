// app/api/payments/receipt-pdf/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { getReceiptPdfData } from "@/features/payments/pdf/getReceiptPdfData";
import { ReceiptPdfDocument, type ReceiptPdfLabels } from "@/features/payments/pdf/ReceiptPdfDocument";
import { routing } from "@/i18n/routing";
import { parseJsonBody } from "@/utils/parseJsonBody";

type Locale = (typeof routing.locales)[number];

function resolveLocale(input: unknown): Locale {
	return typeof input === "string" && (routing.locales as readonly string[]).includes(input)
		? (input as Locale)
		: routing.defaultLocale;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ contractId?: string; locale?: unknown }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { contractId, locale: rawLocale } = body;
	if (!contractId) {
		return NextResponse.json({ error: "contractId가 필요합니다." }, { status: 400 });
	}
	const locale = resolveLocale(rawLocale);

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const data = await getReceiptPdfData(contractId, locale);
	if (!data) {
		return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
	}

	if (data.buyerId !== user.id && data.sellerId !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	if (!data.paymentConfirmedAt) {
		return NextResponse.json({ error: "결제 완료된 거래만 영수증 발급 가능합니다." }, { status: 400 });
	}

	const t = await getTranslations({ locale, namespace: "ReceiptPdfDocument" });
	const labels: ReceiptPdfLabels = {
		brand: t("brand"),
		title: t("title"),
		issuedLine: (date) => t("issuedLine", { date }),
		statusConfirmed: t("statusConfirmed"),
		contractNumberLabel: t("contractNumberLabel"),
		transactionDateLabel: t("transactionDateLabel"),
		listingTitleLabel: t("listingTitleLabel"),
		paymentMethodLabel: t("paymentMethodLabel"),
		paymentMethodValue: t("paymentMethodValue"),
		amountLabel: t("amountLabel"),
		buyerSectionTitle: t("buyerSectionTitle"),
		sellerSectionTitle: t("sellerSectionTitle"),
		representativeLabel: t("representativeLabel"),
		addressLabel: t("addressLabel"),
		bankNameLabel: t("bankNameLabel"),
		notice: t("notice"),
		footer: t("footer"),
	};

	const pdfBuffer = await renderToBuffer(
		<ReceiptPdfDocument
			contractNumber={data.contractNumber}
			paymentConfirmedAt={data.paymentConfirmedAt}
			listingTitle={data.listingTitle}
			price={data.price}
			currency={data.currency}
			buyerCompany={data.buyerCompany}
			sellerCompany={data.sellerCompany}
			labels={labels}
		/>,
	);

	const fileName = `${t("fileNamePrefix")}_${data.contractNumber}.pdf`;

	return new NextResponse(new Uint8Array(pdfBuffer), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
		},
	});
}
