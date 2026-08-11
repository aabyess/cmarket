import { createClient } from "@/libs/supabase";
import { ListingFormData } from "@/features/buyer/types";

export async function postListing(data: ListingFormData) {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("listings").insert({
		user_id: user.id,
		title: data.title,
		category: data.category,
		description: data.description,
		items: data.items,
		currency: data.currency,
		budget_public: data.budgetPublic,
		total_budget: data.totalBudget,
		end_date: data.endDate || null,
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

	const { error } = await supabase
		.from("listings")
		.update({
			title: data.title,
			category: data.category,
			description: data.description,
			items: data.items,
			currency: data.currency,
			budget_public: data.budgetPublic,
			total_budget: data.totalBudget,
			end_date: data.endDate || null,
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