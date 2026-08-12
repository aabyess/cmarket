import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { listingId, price, currency, deliveryDays, note } = await req.json();

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: listing } = await admin
		.from("listings")
		.select("id, title, user_id")
		.eq("id", listingId)
		.single();

	if (!listing) {
		return NextResponse.json({ error: "공고를 찾을 수 없습니다." }, { status: 404 });
	}

	const { data: quote, error: quoteError } = await admin
		.from("quotes")
		.insert({
			listing_id: listingId,
			seller_id: user.id,
			price,
			currency,
			delivery_days: deliveryDays,
			note,
		})
		.select("id")
		.single();

	if (quoteError) {
		return NextResponse.json({ error: quoteError.message }, { status: 500 });
	}

	// 발주사에게 알린다. 알림은 남의 행에 쓰는 것이라 RLS 를 통과하지 못하므로
	// 클라이언트가 아니라 여기서 만든다.
	const { data: company } = await admin
		.from("companies")
		.select("company_name")
		.eq("profile_id", user.id)
		.single();

	const { error: notificationError } = await admin.from("notifications").insert({
		profile_id: listing.user_id,
		type: "quote",
		quote_id: quote.id,
		title: "새 견적이 도착했어요",
		content: `${company?.company_name ?? "공급기업"} · ${listing.title}`,
	});

	// 알림 실패가 견적 제출을 되돌리지는 않는다. 견적은 이미 저장됐고,
	// 알림이 없다고 해서 사라진 것처럼 보이면 안 된다.
	if (notificationError) {
		console.error("notificationError:", notificationError);
	}

	return NextResponse.json({ quoteId: quote.id });
}
