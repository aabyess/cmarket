import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { SellerDashboardData } from "@/features/seller/types";
import type { OpenListing } from "@/features/seller/types";
import type { ListingDetail } from "@/features/seller/types";
import type { MyQuote } from "@/features/seller/types";

export async function getSellerCompanyName(): Promise<string> {
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

export async function getSellerDashboardData(): Promise<SellerDashboardData> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) return { openListingCount: 0, quoteCount: 0 };

	const { count } = await supabase
		.from("listings")
		.select("*", { count: "exact", head: true })
		.eq("status", "active");

	return {
		openListingCount: count ?? 0,
		quoteCount: 0,
	};
}

export async function getOpenListings(): Promise<OpenListing[]> {
	const supabase = await createServerSupabaseClient();

	const { data, error } = await supabase
		.from("listings")
		.select(
			"id, title, description, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, created_at",
		)
		.eq("status", "active")
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => ({
		id: row.id,
		title: row.title,
		description: row.description ?? "",
		items: row.items,
		currency: row.currency,
		totalBudget: Number(row.total_budget ?? 0),
		budgetPublic: row.budget_public ?? false,
		endDate: row.end_date,
		deliveryProvinsi: row.delivery_provinsi ?? "",
		deliveryCity: row.delivery_city ?? "",
		createdAt: row.created_at,
	}));
}

export async function getListingDetail(listingId: string): Promise<ListingDetail | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();

	const { data, error } = await supabase
		.from("listings")
		.select(
			"id, title, description, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, delivery_address, delivery_days, created_at, user_id",
		)
		.eq("id", listingId)
		.single();

	if (error || !data) return null;

	const { data: company } = await supabase
		.from("companies")
		.select("company_name")
		.eq("profile_id", data.user_id)
		.single();

	let hasSubmittedQuote = false;
	if (user) {
		const { count } = await supabase
			.from("quotes")
			.select("*", { count: "exact", head: true })
			.eq("listing_id", listingId)
			.eq("seller_id", user.id);
		hasSubmittedQuote = (count ?? 0) > 0;
	}

	return {
		id: data.id,
		title: data.title,
		description: data.description ?? "",
		items: data.items,
		currency: data.currency,
		totalBudget: Number(data.total_budget ?? 0),
		budgetPublic: data.budget_public ?? false,
		endDate: data.end_date,
		deliveryProvinsi: data.delivery_provinsi ?? "",
		deliveryCity: data.delivery_city ?? "",
		deliveryAddress: data.delivery_address ?? "",
		deliveryDays: data.delivery_days ?? 0,
		createdAt: data.created_at,
		companyName: company?.company_name ?? "",
		hasSubmittedQuote,
	};
}

export async function getMyQuotes(): Promise<MyQuote[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from("quotes")
		.select(
			"id, listing_id, price, currency, delivery_days, note, status, created_at, listings(title, end_date, user_id)",
		)
		.eq("seller_id", user.id)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	if (!data) return [];

	const buyerIds = data
		.map((row) => (row.listings as unknown as { user_id: string } | null)?.user_id)
		.filter(Boolean) as string[];

	const { data: companies } = await supabase
		.from("companies")
		.select("profile_id, company_name")
		.in("profile_id", buyerIds);

	const companyMap = new Map(
		(companies ?? []).map((c) => [c.profile_id, c.company_name]),
	);

	return data.map((row) => {
		const listing = row.listings as unknown as {
			title: string;
			end_date: string;
			user_id: string;
		} | null;

		return {
			id: row.id,
			listingId: row.listing_id,
			listingTitle: listing?.title ?? "",
			buyerCompanyName: companyMap.get(listing?.user_id ?? "") ?? "",
			price: Number(row.price),
			currency: row.currency,
			deliveryDays: row.delivery_days,
			note: row.note ?? "",
			status: row.status,
			createdAt: row.created_at,
			listingEndDate: listing?.end_date ?? "",
		};
	});
}

