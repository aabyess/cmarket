import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { BuyerDashboardData } from "@/features/buyer/types";

export async function getBuyerCompanyName(): Promise<string> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return "";

	const { data } = await supabase
		.from("companies")
		.select("company_name")
		.eq("profile_id", user.id)
		.single();

	return data?.company_name ?? "";
}

export async function getBuyerDashboardData(): Promise<BuyerDashboardData> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		return {
			listingCount: 0,
			todos: [],
			savings: { totalAmount: 0, completedCount: 0 },
			badges: { quotes: 0, chats: 0 },
			activities: [],
		};
	}

	const { count } = await supabase
		.from("listings")
		.select("*", { count: "exact", head: true })
		.eq("user_id", user.id);

	return {
		listingCount: count ?? 0,
		todos: [],
		savings: { totalAmount: 0, completedCount: 0 },
		badges: { quotes: 0, chats: 0 },
		activities: [],
	};
}