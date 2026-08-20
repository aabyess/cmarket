import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(req: NextRequest): Promise<NextResponse> {
	const formData = await req.formData();
	const contractId = formData.get("contractId") as string;
	const file = formData.get("file") as File;

	if (!contractId || !file) {
		return NextResponse.json({ error: "contractId와 파일이 필요합니다." }, { status: 400 });
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
	}

	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({ error: "파일 크기는 5MB를 초과할 수 없습니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	// 본인 계약인지 확인 (buyer만 업로드 가능)
	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id, payment_receipt_url, payment_confirmed_at")
		.eq("id", contractId)
		.single();

	if (!contract || contract.buyer_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	// 판매자가 이미 입금 확인한 뒤에는 영수증 교체 불가
	if (contract.payment_confirmed_at) {
		return NextResponse.json({ error: "이미 입금 확인된 계약입니다." }, { status: 400 });
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

	// 재업로드 시 이전 파일이 버킷에 고아로 남지 않게 지운다. 실패해도 업로드를 되돌리지 않는다.
	if (contract.payment_receipt_url && contract.payment_receipt_url !== storagePath) {
		await admin.storage.from("quote-documents").remove([contract.payment_receipt_url]);
	}

	return NextResponse.json({ receiptUrl: storagePath });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
	const { contractId } = await req.json();
	if (!contractId) {
		return NextResponse.json({ error: "contractId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	// 본인 계약인지 확인 (buyer만 삭제 가능)
	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id, payment_receipt_url, payment_confirmed_at")
		.eq("id", contractId)
		.single();

	if (!contract || contract.buyer_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	if (!contract.payment_receipt_url) {
		return NextResponse.json({ error: "삭제할 영수증이 없습니다." }, { status: 400 });
	}

	// 판매자가 이미 입금 확인한 뒤에는 삭제 불가
	if (contract.payment_confirmed_at) {
		return NextResponse.json({ error: "이미 입금 확인된 계약입니다." }, { status: 400 });
	}

	// 스토리지 파일 삭제는 실패해도 계약 상태 정리를 막지 않는다
	await admin.storage.from("quote-documents").remove([contract.payment_receipt_url]);

	const { error: updateError } = await admin
		.from("contracts")
		.update({ payment_receipt_url: null })
		.eq("id", contractId);

	if (updateError) {
		return NextResponse.json({ error: updateError.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
