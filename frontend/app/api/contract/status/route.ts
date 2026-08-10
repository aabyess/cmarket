import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
	const { contractId, status } = await req.json();
	if (!contractId || !status) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const { data: { user } } = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	// 계약 조회 — 권한 및 역할 확인
	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id, seller_id, status")
		.eq("id", contractId)
		.single();

	if (!contract) {
		return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
	}

	const isBuyer = contract.buyer_id === user.id;
	const isSeller = contract.seller_id === user.id;

	if (!isBuyer && !isSeller) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	// 입금 확인(completed)은 Seller만 가능
	if (status === "completed" && !isSeller) {
		return NextResponse.json({ error: "입금 확인은 공급기업만 가능합니다." }, { status: 403 });
	}

	const updateData: Record<string, string> = { status };
	if (status === "completed") {
		updateData.payment_confirmed_at = new Date().toISOString();
	}

	const { error } = await admin
		.from("contracts")
		.update(updateData)
		.eq("id", contractId);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}