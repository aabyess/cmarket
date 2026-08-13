import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";

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

	const { id, title, content, isPinned, publish } = await req.json();

	if (typeof title !== "string" || title.trim().length === 0) {
		return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
	}
	if (typeof content !== "string" || content.trim().length === 0) {
		return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();

	// 발행 취소 시 published_at 을 비운다. 발행 시각은 최초 발행 때만 찍는다.
	const row = {
		title: title.trim(),
		content: content.trim(),
		is_pinned: Boolean(isPinned),
	};

	if (id) {
		const { data: current } = await supabase
			.from("notices")
			.select("published_at")
			.eq("id", id)
			.maybeSingle();

		const publishedAt = publish ? (current?.published_at ?? new Date().toISOString()) : null;

		const { error } = await supabase
			.from("notices")
			.update({ ...row, published_at: publishedAt })
			.eq("id", id);

		if (error) return NextResponse.json({ error: error.message }, { status: 500 });
		return NextResponse.json({ noticeId: id });
	}

	const { data, error } = await supabase
		.from("notices")
		.insert({
			...row,
			published_at: publish ? new Date().toISOString() : null,
			created_by: admin.userId,
		})
		.select("id")
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ noticeId: data.id });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const id = req.nextUrl.searchParams.get("id");
	if (!id) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

	const supabase = await createServerSupabaseClient();
	const { error } = await supabase.from("notices").delete().eq("id", id);

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ success: true });
}
