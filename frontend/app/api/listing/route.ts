import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { parseJsonBody } from "@/utils/parseJsonBody";
import type { ListingFormData } from "@/features/buyer/types";

const DEFAULT_DEADLINE_DAYS = 7;
const NOTIFY_CHUNK_SIZE = 500;

function getAutoDeadline(): string {
	const deadline = new Date();
	deadline.setDate(deadline.getDate() + DEFAULT_DEADLINE_DAYS);
	return deadline.toISOString();
}

function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		chunks.push(items.slice(i, i + size));
	}
	return chunks;
}

/** 관심 카테고리로 등록해둔 셀러들에게 알린다. 대상이 없거나 실패해도 공고 등록은 되돌리지 않는다. */
async function notifyMatchingSellers(authorId: string, category: string, listingTitle: string): Promise<void> {
	const admin = await createServerAdminClient();

	const { data: matches, error } = await admin
		.from("company_profiles")
		.select("profile_id")
		.contains("categories", [category]);

	if (error) {
		console.error("newListing matching error:", error.message);
		return;
	}

	const sellerIds = (matches ?? [])
		.map((row) => row.profile_id)
		.filter((profileId) => profileId !== authorId);

	if (sellerIds.length === 0) return;

	// 알림 제목/본문 번역은 공고당 한 번만 만들어 대상 셀러 전원에게 재사용한다.
	const notificationTitle = "관심 카테고리에 새 공고가 등록됐어요";
	const [titleTranslation, contentTranslation] = await Promise.all([
		translateFieldServer(notificationTitle),
		translateFieldServer(listingTitle),
	]);

	const rows = sellerIds.map((profileId) => ({
		profile_id: profileId,
		type: "newListing",
		title: notificationTitle,
		content: listingTitle,
		title_source_lang: titleTranslation?.sourceLang ?? null,
		title_translations: titleTranslation?.translations ?? null,
		content_source_lang: contentTranslation?.sourceLang ?? null,
		content_translations: contentTranslation?.translations ?? null,
	}));

	for (const batch of chunk(rows, NOTIFY_CHUNK_SIZE)) {
		const { error: insertError } = await admin.from("notifications").insert(batch);
		if (insertError) console.error("newListing notification insert error:", insertError.message);
	}
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<ListingFormData>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}

	if (!body.title || !body.category) {
		return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
	}

	const titleTranslation = await translateFieldServer(body.title);

	const { data: listing, error } = await supabase
		.from("listings")
		.insert({
			user_id: user.id,
			title: body.title,
			title_source_lang: titleTranslation?.sourceLang ?? null,
			title_translations: titleTranslation?.translations ?? null,
			category: body.category,
			description: body.description,
			items: body.items,
			currency: body.currency,
			budget_public: body.budgetPublic,
			total_budget: body.totalBudget,
			end_date: getAutoDeadline(),
			delivery_days: body.deliveryDays,
			delivery_method: body.deliveryMethod,
			delivery_provinsi: body.deliveryProvinsi,
			delivery_city: body.deliveryCity,
			delivery_address: body.deliveryAddress,
			delivery_address_detail: body.deliveryAddressDetail,
			delivery_lat: body.deliveryLat,
			delivery_lng: body.deliveryLng,
			delivery_timing_mode: body.deliveryTimingMode,
			delivery_deadline_date: body.deliveryDeadlineDate,
			attachments: body.attachments,
			contact_name: body.contactName,
			contact_phone: body.contactPhone,
			status: "active",
		})
		.select("id")
		.single();

	if (error || !listing) {
		return NextResponse.json({ error: error?.message ?? "공고 등록에 실패했습니다." }, { status: 500 });
	}

	try {
		await notifyMatchingSellers(user.id, body.category, body.title);
	} catch (notifyError) {
		console.error("newListing notification error:", notifyError);
	}

	return NextResponse.json({ listingId: listing.id });
}
