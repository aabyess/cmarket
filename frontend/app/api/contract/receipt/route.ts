import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const formData = await req.formData();
	const contractId = formData.get("contractId") as string;
	const file = formData.get("file") as File;

	if (!contractId || !file) {
		return NextResponse.json({ error: "contractId와 파일이 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const { data: { user } } = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	// 본인 계약인지 확인 (buyer만 업로드 가능)
	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id")
		.eq("id", contractId)
		.single();

	if (!contract || contract.buyer_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const fileBuffer = await file.arrayBuffer();
	const fileExt = file.name.split(".").pop();
	const storagePath = `receipts/${contractId}/${Date.now()}.${fileExt}`;

	const { error: uploadError } = await admin.storage
		.from("quote-documents")
		.upload(storagePath, fileBuffer, { contentType: file.type });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	const { error: updateError } = await admin
		.from("contracts")
		.update({ payment_receipt_url: storagePath })
		.eq("id", contractId);

	if (updateError) {
		return NextResponse.json({ error: updateError.message }, { status: 500 });
	}

	return NextResponse.json({ receiptUrl: storagePath });
}