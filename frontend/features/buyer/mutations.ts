import { createClient } from "@/libs/supabase";
import { ListingFormData } from "@/features/buyer/types";

export async function postListing(data: ListingFormData) {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("listings").insert({
		user_id: user.id,
		type: data.type,
		title: data.title,
		description: data.description,
		items: data.items,
		budget_public: data.budgetPublic,
		total_budget: data.totalBudget,
		start_date: data.startDate,
		end_date: data.endDate,
		winner_selection: data.winnerSelection,
		delivery_days: data.deliveryDays,
		contact_name: data.contactName,
		contact_phone: data.contactPhone,
		contact_email: data.contactEmail,
	});

	if (error) throw error;
}