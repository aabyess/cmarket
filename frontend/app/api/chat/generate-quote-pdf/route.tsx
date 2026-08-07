import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServerSupabaseClient, createServiceRoleClient } from "@/libs/supabaseServer";
import { getQuotePdfData } from "@/features/chat/pdf/getQuotePdfData";
import { QuotePdfDocument } from "@/features/chat/pdf/QuotePdfDocument";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId } = await req.json();
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const data = await getQuotePdfData(quoteId);
	if (!data) {
		return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
	}

	if (data.buyerId !== user.id && data.sellerId !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const admin = createServiceRoleClient();

	const { data: existing } = await admin
		.from("messages")
		.select("id, attachment_url, attachment_name")
		.eq("quote_id", quoteId)
		.eq("message_type", "quote_pdf")
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
		<QuotePdfDocument
			listing={data.listing}
			quote={data.quote}
			buyerCompany={data.buyerCompany}
			sellerCompany={data.sellerCompany}
		/>,
	);

	const fileName = `견적서_${data.listing.title}.pdf`;
	const storagePath = `${quoteId}/${Date.now()}.pdf`;

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
		message_type: "quote_pdf",
		attachment_url: storagePath,
		attachment_name: fileName,
	});

	if (insertError) {
		return NextResponse.json({ error: insertError.message }, { status: 500 });
	}

	return NextResponse.json({ attachmentUrl: storagePath, attachmentName: fileName, alreadyExists: false });
}