// app/api/cron/keepalive/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/libs/supabaseServer";

// Supabase 무료 플랜은 일정 기간 요청이 없으면 프로젝트를 자동 일시중지한다.
// Vercel Cron(vercel.json)이 하루 한 번 이 라우트를 호출해 가벼운 DB 쿼리로 활동을 남긴다.
export async function GET(req: NextRequest): Promise<NextResponse> {
	// CRON_SECRET이 설정돼 있으면 Vercel Cron이 Authorization 헤더로 함께 보낸다.
	const cronSecret = process.env.CRON_SECRET;
	if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const supabase = createServiceRoleClient();
	const { error } = await supabase.from("profiles").select("id").limit(1);
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}
