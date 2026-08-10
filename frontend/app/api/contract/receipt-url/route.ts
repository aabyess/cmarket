import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

export async function GET(req: NextRequest): Promise<NextResponse> {
	const contractId = req.nextUrl.searchParams.get("contractId");
	if (!contractId) {
		return NextResponse.json({ error: "contractId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const { data: { user } } = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id, seller_id, payment_receipt_url")
		.eq("id", contractId)
		.single();

	if (!contract) {
		return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
	}

	if (contract.buyer_id !== user.id && contract.seller_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	if (!contract.payment_receipt_url) {
		return NextResponse.json({ error: "영수증이 없습니다." }, { status: 404 });
	}

	const { data: signed, error } = await admin.storage
		.from("quote-documents")
		.createSignedUrl(contract.payment_receipt_url, 60 * 10);

	if (error || !signed) {
		return NextResponse.json({ error: error?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	return NextResponse.json({ url: signed.signedUrl });
}