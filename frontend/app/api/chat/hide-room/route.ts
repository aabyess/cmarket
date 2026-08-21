// app/api/chat/hide-room/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ quoteId?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { quoteId } = body;
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	// RLS가 profile_id = auth.uid()만 허용하므로 소유권 확인은 DB가 최종 방어선이다.
	const { error } = await supabase
		.from("chat_hidden_rooms")
		.upsert(
			{ profile_id: user.id, quote_id: quoteId, hidden_at: new Date().toISOString() },
			{ onConflict: "profile_id,quote_id" },
		);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
