import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { BuyerDashboardData } from "@/features/buyer/types";
import type { ListingSummary } from "@/features/buyer/types";

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

export async function getBuyerListings(): Promise<ListingSummary[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from("listings")
		.select("id, title, items, currency, total_budget, budget_public, end_date, status, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => ({
		id: row.id,
		title: row.title,
		items: row.items,
		currency: row.currency,
		totalBudget: Number(row.total_budget ?? 0),
		budgetPublic: row.budget_public ?? false,
		endDate: row.end_date,
		status: row.status ?? "active",
		createdAt: row.created_at,
		quoteCount: 0,
	}));
}