import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId } = await req.json();
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const { data: { user } } = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const supabase = await createServerAdminClient();

	const { data: contractId, error } = await supabase.rpc("award_quote", {
		p_quote_id: quoteId,
		p_buyer_id: user.id,
	});

	if (error) {
		if (error.message.includes("QUOTE_NOT_FOUND")) {
			return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
		}
		if (error.message.includes("LISTING_NOT_FOUND")) {
			return NextResponse.json({ error: "공고를 찾을 수 없습니다." }, { status: 404 });
		}
		if (error.message.includes("FORBIDDEN")) {
			return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
		}
		if (error.message.includes("LISTING_ALREADY_AWARDED")) {
			return NextResponse.json({ error: "이미 다른 견적이 낙찰된 공고입니다." }, { status: 409 });
		}
		if (error.message.includes("ALREADY_AWARDED")) {
			return NextResponse.json({ error: "이미 낙찰된 견적입니다." }, { status: 409 });
		}
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ contractId });
}