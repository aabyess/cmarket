import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { FREE_PLAN_MONTHLY_CHAT_LIMIT } from "@/constants/plan";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId, content } = await req.json();
	if (!quoteId || !content?.trim()) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

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
