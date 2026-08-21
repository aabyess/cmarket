// app/api/admin/user-plan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";
import type { Plan } from "@/constants/plan";

const PLAN_ALLOWLIST: Plan[] = ["free", "pro", "max"];

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

export async function POST(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const body = await parseJsonBody<{ profileId?: string; plan?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { profileId, plan } = body;
	if (!profileId || !plan) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}
	if (!PLAN_ALLOWLIST.includes(plan as Plan)) {
		return NextResponse.json({ error: "허용되지 않는 플랜 값입니다." }, { status: 400 });
	}

	// UI에서도 본인 행은 비활성화하지만, 직접 API 호출로 우회할 수 있으니 서버에서도 막는다.
	if (profileId === admin.userId) {
		return NextResponse.json({ error: "본인 계정의 플랜은 변경할 수 없습니다." }, { status: 400 });
	}

	const adminSupabase = await createServerAdminClient();
	const { error } = await adminSupabase.from("profiles").update({ plan }).eq("id", profileId);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
