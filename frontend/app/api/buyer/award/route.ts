import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/libs/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId } = await req.json();
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}

	const supabase = await createServerAdminClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const { data: quote, error: quoteError } = await supabase
		.from("quotes")
		.select("id, listing_id, seller_id, status")
		.eq("id", quoteId)
		.single();

	if (quoteError || !quote) {
		return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
	}

	if (quote.status === "awarded") {
		return NextResponse.json({ error: "이미 낙찰된 견적입니다." }, { status: 409 });
	}

	const { error: updateError } = await supabase
		.from("quotes")
		.update({ status: "awarded" })
		.eq("id", quoteId);

	if (updateError) {
		return NextResponse.json({ error: updateError.message }, { status: 500 });
	}

	const { data: contract, error: contractError } = await supabase
		.from("contracts")
		.insert({
			listing_id: quote.listing_id,
			quote_id: quoteId,
			buyer_id: user.id,
			seller_id: quote.seller_id,
			status: "ongoing",
		})
		.select("id")
		.single();

	if (contractError) {
		return NextResponse.json({ error: contractError.message }, { status: 500 });
	}

	return NextResponse.json({ contractId: contract.id });
}