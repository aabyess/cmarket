import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ inquiryId?: string; content?: unknown }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { inquiryId, content } = body;

	if (typeof content !== "string" || content.trim().length === 0) {
		return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.maybeSingle();

	const isStaff = profile?.role === "admin";

	// RLS 가 본인 문의인지 검사한다. 여기서는 운영자 여부만 판단해 표시를 나눈다.
	const { error } = await supabase
		.from("support_inquiry_replies")
		.insert({ inquiry_id: inquiryId, content: content.trim(), is_staff: isStaff, created_by: user.id });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// 운영자가 답하면 문의 상태를 옮긴다. 상태 변경은 운영자만 할 수 있으므로 서비스 롤로 쓴다.
	if (isStaff) {
		const admin = await createServerAdminClient();
		await admin
			.from("support_inquiries")
			.update({ status: "ANSWERED", answered_at: new Date().toISOString() })
			.eq("id", inquiryId);
	}

	return NextResponse.json({ success: true });
}
