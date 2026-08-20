import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { FREE_PLAN_MONTHLY_CHAT_LIMIT } from "@/constants/plan";

const MAX_CONTENT_LENGTH = 2000;

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId, content } = await req.json();
	if (!quoteId || !content?.trim()) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	// DeepL 3회 호출 전에 길이를 막지 않으면 거대한 페이로드로 번역 쿼터를 태울 수 있다.
	if (typeof content !== "string" || content.length > MAX_CONTENT_LENGTH) {
		return NextResponse.json({ error: "메시지가 너무 깁니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	// 번역(DeepL 비용)이 발생하기 전에 이 채팅의 참여자인지 확인한다.
	// insert 자체는 RLS로 막히지만, 그 전에 번역부터 하면 비참여자도 쿼터를 소모시킬 수 있다.
	const { data: quote } = await admin
		.from("quotes")
		.select("seller_id, listings(user_id)")
		.eq("id", quoteId)
		.single();

	const buyerId = (quote?.listings as unknown as { user_id: string } | null)?.user_id;
	if (!quote || (quote.seller_id !== user.id && buyerId !== user.id)) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const { data: profile } = await admin.from("profiles").select("plan").eq("id", user.id).single();
	const plan = profile?.plan ?? "free";

	let limitExceeded = false;

	if (plan === "free") {
		const startOfMonth = new Date();
		startOfMonth.setDate(1);
		startOfMonth.setHours(0, 0, 0, 0);

		const { count } = await admin
			.from("messages")
			.select("*", { count: "exact", head: true })
			.eq("sender_id", user.id)
			.gte("created_at", startOfMonth.toISOString());

		limitExceeded = (count ?? 0) >= FREE_PLAN_MONTHLY_CHAT_LIMIT;
	}

	const translation = limitExceeded ? null : await translateFieldServer(content);

	const { error } = await supabase.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content,
		source_lang: translation?.sourceLang ?? null,
		translations: translation?.translations ?? null,
	});

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ limitExceeded });
}
