import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { ListingWithQuotes, ReceivedQuote, ListingSummary,  BuyerDashboardData  } from "@/features/buyer/types";

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

export async function getListingsWithQuoteCount(): Promise<ListingWithQuotes[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from("listings")
		.select("id, title, end_date, status, quotes(id)")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => ({
		id: row.id,
		title: row.title,
		endDate: row.end_date,
		status: row.status ?? "active",
		quoteCount: (row.quotes as unknown as { id: string }[])?.length ?? 0,
	}));
}

export async function getQuotesByListing(listingId: string): Promise<ReceivedQuote[]> {
	const supabase = await createServerSupabaseClient();

	const { data, error } = await supabase
		.from("quotes")
		.select("id, listing_id, seller_id, price, currency, delivery_days, note, status, created_at")
		.eq("listing_id", listingId)
		.order("price", { ascending: true });

	if (error) throw new Error(error.message);
	if (!data || data.length === 0) return [];

	const sellerIds = data.map((row) => row.seller_id);

	const { data: companies } = await supabase
		.from("companies")
		.select("profile_id, company_name, representative, business_number, address, business_type, business_item")
		.in("profile_id", sellerIds);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c]));

	return data.map((row) => {
		const company = companyMap.get(row.seller_id);

		return {
			id: row.id,
			listingId: row.listing_id,
			price: Number(row.price),
			currency: row.currency,
			deliveryDays: row.delivery_days,
			note: row.note ?? "",
			status: row.status,
			createdAt: row.created_at,
			seller: {
				companyName: company?.company_name ?? "",
				representative: company?.representative ?? "",
				businessNumber: company?.business_number ?? "",
				address: company?.address ?? "",
				businessType: company?.business_type ?? "",
				businessItem: company?.business_item ?? "",
			},
		};
	});
}
