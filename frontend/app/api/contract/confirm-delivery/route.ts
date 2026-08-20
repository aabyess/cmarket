// app/api/contract/confirm-delivery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ contractId?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { contractId } = body;
	if (!contractId) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	// 계약 조회 — 권한 및 상태 확인
	const { data: contract } = await admin
		.from("contracts")
		.select("buyer_id, status, delivery_confirmed_at")
		.eq("id", contractId)
		.single();

	if (!contract) {
		return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
	}

	// 물품 수령 확인은 Buyer만 가능
	if (contract.buyer_id !== user.id) {
		return NextResponse.json({ error: "수령 확인은 발주기업만 가능합니다." }, { status: 403 });
	}

	if (contract.status === "cancelled") {
		return NextResponse.json({ error: "취소된 계약입니다." }, { status: 400 });
	}

	if (contract.delivery_confirmed_at) {
		return NextResponse.json({ error: "이미 수령 확인된 계약입니다." }, { status: 400 });
	}

	const { error } = await admin
		.from("contracts")
		.update({ delivery_confirmed_at: new Date().toISOString() })
		.eq("id", contractId);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
