import { createClient } from "@/libs/supabase";
import { translateField } from "@/utils/translateField";
import { ListingFormData } from "@/features/buyer/types";

const DEFAULT_DEADLINE_DAYS = 7;

function getAutoDeadline(): string {
	const deadline = new Date();
	deadline.setDate(deadline.getDate() + DEFAULT_DEADLINE_DAYS);
	return deadline.toISOString();
}

export async function postListing(data: ListingFormData) {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const titleTranslation = await translateField(data.title);

	const { error } = await supabase.from("listings").insert({
		user_id: user.id,
		title: data.title,
		title_source_lang: titleTranslation?.sourceLang ?? null,
		title_translations: titleTranslation?.translations ?? null,
		category: data.category,
		description: data.description,
		items: data.items,
		currency: data.currency,
		budget_public: data.budgetPublic,
		total_budget: data.totalBudget,
		end_date: getAutoDeadline(),
		delivery_days: data.deliveryDays,
		delivery_method: data.deliveryMethod,
		delivery_provinsi: data.deliveryProvinsi,
		delivery_city: data.deliveryCity,
		delivery_address: data.deliveryAddress,
		delivery_address_detail: data.deliveryAddressDetail,
		delivery_lat: data.deliveryLat,
		delivery_lng: data.deliveryLng,
		delivery_timing_mode: data.deliveryTimingMode,
		delivery_deadline_date: data.deliveryDeadlineDate,
		attachments: data.attachments,
		contact_name: data.contactName,
		contact_phone: data.contactPhone,
		status: "active",
	});

	if (error) throw error;
}

export async function updateListing(id: string, data: ListingFormData): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const titleTranslation = await translateField(data.title);

	const { error } = await supabase
		.from("listings")
		.update({
			title: data.title,
			title_source_lang: titleTranslation?.sourceLang ?? null,
			title_translations: titleTranslation?.translations ?? null,
			category: data.category,
			description: data.description,
			items: data.items,
			currency: data.currency,
			budget_public: data.budgetPublic,
			total_budget: data.totalBudget,
			delivery_days: data.deliveryDays,
			delivery_method: data.deliveryMethod,
			delivery_provinsi: data.deliveryProvinsi,
			delivery_city: data.deliveryCity,
			delivery_address: data.deliveryAddress,
			delivery_address_detail: data.deliveryAddressDetail,
			delivery_lat: data.deliveryLat,
			delivery_lng: data.deliveryLng,
			delivery_timing_mode: data.deliveryTimingMode,
			delivery_deadline_date: data.deliveryDeadlineDate,
			attachments: data.attachments,
			contact_name: data.contactName,
			contact_phone: data.contactPhone,
		})
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase
		.from("listings")
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}

export async function extendListingDeadline(id: string, extendDays: number): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	// "오늘 + N일"이 아니라 "기존 마감일 + N일"이어야 연장이다.
	// 기존 마감일이 이미 지났으면 오늘을 기준으로 연장한다.
	const { data: current, error: fetchError } = await supabase
		.from("listings")
		.select("end_date")
		.eq("id", id)
		.eq("user_id", user.id)
		.single();

	if (fetchError || !current) throw new Error("공고를 찾을 수 없습니다.");

	const base = new Date(Math.max(new Date(current.end_date).getTime(), Date.now()));
	const newDeadline = new Date(base);
	newDeadline.setDate(newDeadline.getDate() + extendDays);

	const { error } = await supabase
		.from("listings")
		.update({
			end_date: newDeadline.toISOString(),
			status: "active",
		})
		.eq("id", id)
		.eq("user_id", user.id);

	if (error) throw error;
}