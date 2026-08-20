import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { routing } from "@/i18n/routing";
import { parseJsonBody } from "@/utils/parseJsonBody";

const CANCEL_ERROR_MESSAGES: Record<string, string> = {
	CONTRACT_NOT_FOUND: "계약을 찾을 수 없습니다.",
	NOT_ONGOING: "진행 중인 계약만 취소할 수 있습니다.",
	RECEIPT_EXISTS: "송금 영수증이 등록된 계약은 취소할 수 없습니다.",
};

/** 운영자 여부는 RLS 가 최종 판단한다. 여기서는 이른 실패로 메시지를 명확히 할 뿐이다. */
async function requireAdmin(): Promise<{ userId: string } | null> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
	return data?.role === "admin" ? { userId: user.id } : null;
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const body = await parseJsonBody<{ contractId?: string; status?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { contractId, status } = body;
	if (!contractId || !status) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const adminSupabase = await createServerAdminClient();

	const { data: contract } = await adminSupabase
		.from("contracts")
		.select("buyer_id, status")
		.eq("id", contractId)
		.single();

	if (!contract) {
		return NextResponse.json({ error: "계약을 찾을 수 없습니다." }, { status: 404 });
	}

	if (status === "cancelled") {
		// cancel_contract 는 당사자 검증을 하므로, 이미 운영자로 확인된 요청이라
		// 계약의 실제 buyer_id 를 그대로 넘겨 통과시킨다.
		const { data: quoteId, error } = await adminSupabase.rpc("cancel_contract", {
			p_contract_id: contractId,
			p_user_id: contract.buyer_id,
		});

		if (error) {
			const message = CANCEL_ERROR_MESSAGES[error.message] ?? "계약 취소 처리 중 오류가 발생했습니다.";
			const httpStatus = error.message === "CONTRACT_NOT_FOUND" ? 404 : 400;
			return NextResponse.json({ error: message }, { status: httpStatus });
		}

		await adminSupabase.storage
			.from("quote-documents")
			.remove(routing.locales.map((locale) => `invoices/${quoteId}/invoice-${locale}.pdf`));

		return NextResponse.json({ success: true });
	}

	if (status === "completed") {
		const { error } = await adminSupabase
			.from("contracts")
			.update({ status: "completed", payment_confirmed_at: new Date().toISOString() })
			.eq("id", contractId);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	}

	return NextResponse.json({ error: "지원하지 않는 상태값입니다." }, { status: 400 });
}
