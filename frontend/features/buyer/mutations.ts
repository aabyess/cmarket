import { createClient } from "@/libs/supabase";
import { ListingFormData } from "@/features/buyer/types";

export async function postListing(data: ListingFormData) {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("listings").insert({
		user_id: user.id,
		title: data.title,
		description: data.description,
		items: data.items,
		currency: data.currency,
		budget_public: data.budgetPublic,
		total_budget: data.totalBudget,
		end_date: data.endDate,
		delivery_days: data.deliveryDays,
		delivery_provinsi: data.deliveryProvinsi,
		delivery_city: data.deliveryCity,
		delivery_address: data.deliveryAddress,
		status: "active",
	});

	if (error) throw error;
}

export async function awardQuote(listingId: string, quoteId: string): Promise<void> {
	const supabase = createClient();

	const { error: awardError } = await supabase
		.from("quotes")
		.update({ status: "awarded" })
		.eq("id", quoteId);

	if (awardError) throw awardError;

	const { error: rejectError } = await supabase
		.from("quotes")
		.update({ status: "rejected" })
		.eq("listing_id", listingId)
		.neq("id", quoteId);

	if (rejectError) throw rejectError;

	const { error: listingError } = await supabase
		.from("listings")
		.update({ status: "awarded" })
		.eq("id", listingId);

	if (listingError) throw listingError;
}