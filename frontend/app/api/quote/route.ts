import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const {
		listingId,
		price,
		currency,
		deliveryDays,
		note,
		noteSourceLang,
		noteTranslations,
		items,
		attachments,
		paymentTerms,
	} = await req.json();

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	// admin 클라이언트는 RLS를 우회하므로 비즈니스 검증을 여기서 직접 한다.
	if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
		return NextResponse.json({ error: "가격이 올바르지 않습니다." }, { status: 400 });
	}
	if (!["USD", "IDR", "KRW"].includes(currency)) {
		return NextResponse.json({ error: "지원하지 않는 통화입니다." }, { status: 400 });
	}
	if (!Number.isInteger(deliveryDays) || deliveryDays <= 0) {
		return NextResponse.json({ error: "납기일수가 올바르지 않습니다." }, { status: 400 });
	}

	const admin = await createServerAdminClient();

	const { data: listing } = await admin
		.from("listings")
		.select("id, title, user_id, status")
		.eq("id", listingId)
		.single();

	if (!listing) {
		return NextResponse.json({ error: "공고를 찾을 수 없습니다." }, { status: 404 });
	}

	if (listing.status !== "active") {
		return NextResponse.json({ error: "마감된 공고에는 견적을 제출할 수 없습니다." }, { status: 400 });
	}

	if (listing.user_id === user.id) {
		return NextResponse.json({ error: "본인 공고에는 견적을 제출할 수 없습니다." }, { status: 400 });
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
			note_source_lang: noteSourceLang ?? null,
			note_translations: noteTranslations ?? null,
			items: items ?? null,
			attachments: attachments ?? null,
			payment_terms: paymentTerms ?? null,
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

	const notificationTitle = "새 견적이 도착했어요";
	const notificationContent = `${company?.company_name ?? "공급기업"} · ${listing.title}`;

	const [titleTranslation, contentTranslation] = await Promise.all([
		translateFieldServer(notificationTitle),
		translateFieldServer(notificationContent),
	]);

	const { error: notificationError } = await admin.from("notifications").insert({
		profile_id: listing.user_id,
		type: "quote",
		quote_id: quote.id,
		title: notificationTitle,
		content: notificationContent,
		title_source_lang: titleTranslation?.sourceLang ?? null,
		title_translations: titleTranslation?.translations ?? null,
		content_source_lang: contentTranslation?.sourceLang ?? null,
		content_translations: contentTranslation?.translations ?? null,
	});

	// 알림 실패가 견적 제출을 되돌리지는 않는다. 견적은 이미 저장됐고,
	// 알림이 없다고 해서 사라진 것처럼 보이면 안 된다.
	if (notificationError) {
		console.error("notificationError:", notificationError);
	}

	return NextResponse.json({ quoteId: quote.id });
}
