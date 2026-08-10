import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { getInvoicePdfData } from "@/features/chat/pdf/getInvoicePdfData";
import { InvoicePdfDocument } from "@/features/chat/pdf/InvoicePdfDocument";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId } = await req.json();
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const { data: { user } } = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const data = await getInvoicePdfData(quoteId);
	if (!data) {
		return NextResponse.json({ error: "데이터를 찾을 수 없습니다." }, { status: 404 });
	}

	if (data.buyerId !== user.id && data.sellerId !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const admin = await createServerAdminClient();

	// 이미 생성된 인보이스가 있으면 재사용
	const { data: existing } = await admin
		.from("messages")
		.select("id, attachment_url, attachment_name")
		.eq("quote_id", quoteId)
		.eq("message_type", "invoice_pdf")
		.limit(1)
		.maybeSingle();

	if (existing) {
		return NextResponse.json({
			attachmentUrl: existing.attachment_url,
			attachmentName: existing.attachment_name,
			alreadyExists: true,
		});
	}

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
		}),
	);

	const fileName = `인보이스_${data.listing.title}_${data.invoiceNumber}.pdf`;
	const storagePath = `invoices/${quoteId}/${Date.now()}.pdf`;

	const { error: uploadError } = await admin.storage
		.from("quote-documents")
		.upload(storagePath, pdfBuffer, { contentType: "application/pdf" });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	const { error: insertError } = await admin.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content: fileName,
		message_type: "invoice_pdf",
		attachment_url: storagePath,
		attachment_name: fileName,
	});

	if (insertError) {
		return NextResponse.json({ error: insertError.message }, { status: 500 });
	}

	return NextResponse.json({
		attachmentUrl: storagePath,
		attachmentName: fileName,
		alreadyExists: false,
	});
}