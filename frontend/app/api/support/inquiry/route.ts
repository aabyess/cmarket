import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { INQUIRY_CATEGORY_OPTIONS } from "@/features/support/constants";
import type { InquiryCategory } from "@/features/support/types";
import { parseJsonBody } from "@/utils/parseJsonBody";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ category?: InquiryCategory; title?: unknown; content?: unknown }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { category, title, content } = body;

	if (typeof title !== "string" || title.trim().length === 0) {
		return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
	}

	if (typeof content !== "string" || content.trim().length === 0) {
		return NextResponse.json({ error: "문의 내용을 입력해주세요." }, { status: 400 });
	}

	if (!INQUIRY_CATEGORY_OPTIONS.includes(category as InquiryCategory)) {
		return NextResponse.json({ error: "문의 유형이 올바르지 않습니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("support_inquiries")
		.insert({ profile_id: user.id, category, title: title.trim(), content: content.trim() })
		.select("id")
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ inquiryId: data.id });
}
