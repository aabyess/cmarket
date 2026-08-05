import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/libs/supabaseServer";

export async function PATCH(req: NextRequest): Promise<NextResponse> {
	const { contractId, status } = await req.json();

	if (!contractId || !status) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const supabase = await createServerAdminClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const { error } = await supabase
		.from("contracts")
		.update({ status })
		.eq("id", contractId)
		.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}