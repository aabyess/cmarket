import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { routing } from "@/i18n/routing";
import { parseJsonBody } from "@/utils/parseJsonBody";

type QuoteMutationBody = {
	listingId?: string;
	quoteId?: string;
	price?: unknown;
	currency?: unknown;
	deliveryDays?: unknown;
	note?: string;
	items?: unknown;
	attachments?: unknown;
	paymentTerms?: unknown;
};

function validateQuoteFields(
	price: unknown,
	currency: unknown,
	deliveryDays: unknown,
): string | null {
	if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
		return "가격이 올바르지 않습니다.";
	}
	if (typeof currency !== "string" || !["USD", "IDR", "KRW"].includes(currency)) {
		return "지원하지 않는 통화입니다.";
	}
	if (!Number.isInteger(deliveryDays) || (deliveryDays as number) <= 0) {
		return "납기일수가 올바르지 않습니다.";
	}
	return null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<QuoteMutationBody>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { listingId, price, currency, deliveryDays, note, items, attachments, paymentTerms } = body;

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	// admin 클라이언트는 RLS를 우회하므로 비즈니스 검증을 여기서 직접 한다.
	const validationError = validateQuoteFields(price, currency, deliveryDays);
	if (validationError) {
		return NextResponse.json({ error: validationError }, { status: 400 });
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

	// 번역을 클라이언트가 만들어 보내면 원문과 다른 "번역"을 저장할 수 있으므로 서버에서 만든다.
	const noteTranslation = note?.trim() ? await translateFieldServer(note) : null;

	const { data: quote, error: quoteError } = await admin
		.from("quotes")
		.insert({
			listing_id: listingId,
			seller_id: user.id,
			price,
			currency,
			delivery_days: deliveryDays,
			note,
			note_source_lang: noteTranslation?.sourceLang ?? null,
			note_translations: noteTranslation?.translations ?? null,
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

// 견적 수정도 서버에서 처리한다 — 번역을 서버에서 만들고(위조 방지),
// 가격 이력 기록과 캐시 PDF 무효화까지 한 곳에서 끝낸다.
export async function PATCH(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<QuoteMutationBody>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { quoteId, price, currency, deliveryDays, note, items, attachments, paymentTerms } = body;

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

	const validationError = validateQuoteFields(price, currency, deliveryDays);
	if (validationError) {
		return NextResponse.json({ error: validationError }, { status: 400 });
	}

	const admin = await createServerAdminClient();

	const { data: current } = await admin
		.from("quotes")
		.select("seller_id, status, price, delivery_days, listing_id")
		.eq("id", quoteId)
		.single();

	if (!current) {
		return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
	}

	if (current.seller_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	if (current.status === "awarded") {
		return NextResponse.json({ error: "확정된 견적은 수정할 수 없습니다." }, { status: 400 });
	}

	const { data: listing } = await admin
		.from("listings")
		.select("status")
		.eq("id", current.listing_id)
		.single();

	if (!listing || listing.status !== "active") {
		return NextResponse.json(
			{ error: "마감된 공고의 견적은 수정할 수 없습니다." },
			{ status: 400 },
		);
	}

	const noteTranslation = note?.trim() ? await translateFieldServer(note) : null;

	const { error: updateError } = await admin
		.from("quotes")
		.update({
			price,
			currency,
			delivery_days: deliveryDays,
			note,
			note_source_lang: noteTranslation?.sourceLang ?? null,
			note_translations: noteTranslation?.translations ?? null,
			items: items ?? null,
			attachments: attachments ?? null,
			payment_terms: paymentTerms ?? null,
			previous_price: current.price,
			previous_delivery_days: current.delivery_days,
			revised_at: new Date().toISOString(),
		})
		.eq("id", quoteId);

	if (updateError) {
		return NextResponse.json({ error: updateError.message }, { status: 500 });
	}

	// 옛 가격/납기로 만들어진 캐시 PDF가 계속 나오지 않도록 지운다.
	// 실패해도 수정을 되돌리지 않는다 — 다음 PDF 요청 때 재생성될 뿐이다.
	const { error: removeError } = await admin.storage
		.from("quote-documents")
		.remove(routing.locales.map((locale) => `${quoteId}/quote-${locale}.pdf`));

	if (removeError) {
		console.error("quote PDF invalidate error:", removeError);
	}

	return NextResponse.json({ success: true });
}
