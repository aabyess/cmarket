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
		.select("id, title, end_date, status, currency, quotes(price, delivery_days)")
		.eq("user_id", user.id)
		.order("end_date", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => {
		const quotes = (row.quotes as unknown as { price: number; delivery_days: number }[]) ?? [];

		return {
			id: row.id,
			title: row.title,
			endDate: row.end_date,
			status: row.status ?? "active",
			currency: row.currency,
			quoteCount: quotes.length,
			lowestPrice: quotes.length > 0 ? Math.min(...quotes.map((q) => Number(q.price))) : null,
			fastestDays: quotes.length > 0 ? Math.min(...quotes.map((q) => q.delivery_days)) : null,
		};
	});
}

export async function getQuotesByListing(listingId: string): Promise<ReceivedQuote[]> {
	const supabase = await createServerSupabaseClient();
	const { createServerAdminClient } = await import("@/libs/supabaseServer");
	const admin = await createServerAdminClient();

	const { data, error } = await supabase
		.from("quotes")
		.select("id, listing_id, seller_id, price, currency, delivery_days, note, status, created_at, previous_price, previous_delivery_days, revised_at")
		.eq("listing_id", listingId)
		.order("price", { ascending: true });

	if (error) throw new Error(error.message);
	if (!data || data.length === 0) return [];

	const sellerIds = data.map((row) => row.seller_id);

	const { data: companies } = await admin
		.from("companies")
		.select("profile_id, company_name, representative, address, business_type, business_item")
		.in("profile_id", sellerIds);

	const { data: profiles } = await admin
		.from("company_profiles")
		.select("profile_id, logo_url")
		.in("profile_id", sellerIds);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c]));
	const profileMap = new Map((profiles ?? []).map((p) => [p.profile_id, p]));

	return data.map((row) => {
		const company = companyMap.get(row.seller_id);
		const profile = profileMap.get(row.seller_id);

		return {
			id: row.id,
			listingId: row.listing_id,
			price: Number(row.price),
			currency: row.currency,
			deliveryDays: row.delivery_days,
			note: row.note ?? "",
			status: row.status,
			createdAt: row.created_at,
			previousPrice: row.previous_price !== null ? Number(row.previous_price) : null,
			previousDeliveryDays: row.previous_delivery_days,
			revisedAt: row.revised_at,
			seller: {
				profileId: row.seller_id,
				companyName: company?.company_name ?? "",
				representative: company?.representative ?? "",
				address: company?.address ?? "",
				businessType: company?.business_type ?? "",
				businessItem: company?.business_item ?? "",
				logoUrl: profile?.logo_url ?? null,
			},
		};
	});
}
