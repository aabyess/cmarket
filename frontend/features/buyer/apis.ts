import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { ListingWithQuotes, ReceivedQuote, ListingSummary, BuyerDashboardData, BuyerTradeSummary, ListingFormData, ListingStatus } from "@/features/buyer/types";
import { getExchangeRates, convertCurrency } from "@/libs/exchangeRate";

async function getSessionUser() {
	const supabase = await createServerSupabaseClient();
	const { data: { session } } = await supabase.auth.getSession();
	return { supabase, user: session?.user ?? null };
}

export async function getBuyerCompanyName(): Promise<string> {
	const { supabase, user } = await getSessionUser();
	if (!user) return "";

	const { data } = await supabase
		.from("companies")
		.select("company_name")
		.eq("profile_id", user.id)
		.single();

	return data?.company_name ?? "";
}

export async function getBuyerDashboardData(): Promise<BuyerDashboardData> {
	const { supabase, user } = await getSessionUser();

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

export async function getBuyerTradeSummary(): Promise<BuyerTradeSummary> {
	const { supabase, user } = await getSessionUser();

	const empty: BuyerTradeSummary = {
		inProgress: { total: 0, subItems: [{ label: "견적", value: 0 }, { label: "공고", value: 0 }] },
		closed: { total: 0, subItems: [{ label: "견적", value: 0 }, { label: "공고", value: 0 }] },
		contracts: { total: 0, subItems: [{ label: "입금 확인 대기", value: 0 }, { label: "입금 확인 완료", value: 0 }] },
	};

	if (!user) return empty;

	const { data: listings, error: listingsError } = await supabase
		.from("listings")
		.select("id, status")
		.eq("user_id", user.id);

	if (listingsError) throw new Error(listingsError.message);

	const activeListingIds = (listings ?? []).filter((l) => l.status === "active").map((l) => l.id);
	const closedListingIds = (listings ?? []).filter((l) => l.status === "closed").map((l) => l.id);
	const allListingIds = (listings ?? []).map((l) => l.id);

	let activeQuoteCount = 0;
	let closedQuoteCount = 0;

	if (allListingIds.length > 0) {
		const { data: quotes, error: quotesError } = await supabase
			.from("quotes")
			.select("listing_id")
			.in("listing_id", allListingIds);

		if (quotesError) throw new Error(quotesError.message);

		activeQuoteCount = (quotes ?? []).filter((q) => activeListingIds.includes(q.listing_id)).length;
		closedQuoteCount = (quotes ?? []).filter((q) => closedListingIds.includes(q.listing_id)).length;
	}

	const { data: contracts, error: contractsError } = await supabase
		.from("contracts")
		.select("payment_confirmed_at")
		.eq("buyer_id", user.id);

	if (contractsError) throw new Error(contractsError.message);

	const pendingCount = (contracts ?? []).filter((c) => !c.payment_confirmed_at).length;
	const confirmedCount = (contracts ?? []).filter((c) => c.payment_confirmed_at).length;

	return {
		inProgress: {
			total: activeListingIds.length,
			subItems: [
				{ label: "견적", value: activeQuoteCount },
				{ label: "공고", value: activeListingIds.length },
			],
		},
		closed: {
			total: closedListingIds.length,
			subItems: [
				{ label: "견적", value: closedQuoteCount },
				{ label: "공고", value: closedListingIds.length },
			],
		},
		contracts: {
			total: (contracts ?? []).length,
			subItems: [
				{ label: "입금 확인 대기", value: pendingCount },
				{ label: "입금 확인 완료", value: confirmedCount },
			],
		},
	};
}

export async function getBuyerListings(): Promise<ListingSummary[]> {
	const { supabase, user } = await getSessionUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from("listings")
		.select("id, title, items, currency, total_budget, budget_public, end_date, status, created_at, category")
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);

	const listingIds = (data ?? []).map((row) => row.id);

	const { data: quoteRows, error: quoteError } = await supabase
		.from("quotes")
		.select("listing_id, status")
		.in("listing_id", listingIds);

	if (quoteError) throw new Error(quoteError.message);

	const quoteCountMap = new Map<string, number>();
	const awardedListingIds = new Set<string>();
	for (const row of quoteRows ?? []) {
		quoteCountMap.set(row.listing_id, (quoteCountMap.get(row.listing_id) ?? 0) + 1);
		if (row.status === "awarded") {
			awardedListingIds.add(row.listing_id);
		}
	}

	return (data ?? []).map((row) => {
		const rawStatus = row.status ?? "active";
		const status = rawStatus === "closed" && awardedListingIds.has(row.id) ? "awarded" : rawStatus;

		return {
			id: row.id,
			title: row.title,
			items: row.items,
			currency: row.currency,
			totalBudget: Number(row.total_budget ?? 0),
			budgetPublic: row.budget_public ?? false,
			endDate: row.end_date,
			status,
			createdAt: row.created_at,
			category: row.category,
			quoteCount: quoteCountMap.get(row.id) ?? 0,
		};
	});
}

export async function getListingsWithQuoteCount(): Promise<ListingWithQuotes[]> {
	const { supabase, user } = await getSessionUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from("listings")
		.select("id, title, end_date, status, currency, created_at, quotes(price, delivery_days)")
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
			createdAt: row.created_at,
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
	const rates = await getExchangeRates();

	return data.map((row) => {
		const company = companyMap.get(row.seller_id);
		const profile = profileMap.get(row.seller_id);
		const price = Number(row.price);
	
		return {
			id: row.id,
			listingId: row.listing_id,
			price,
			currency: row.currency,
			priceInIdr: convertCurrency(price, row.currency, "IDR", rates),
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

export async function getListingDetail(
	id: string,
): Promise<(ListingFormData & { id: string; status: ListingStatus; createdAt: string }) | null> {
	const { supabase, user } = await getSessionUser();
	if (!user) return null;

	const { data, error } = await supabase
		.from("listings")
		.select(
			"id, title, category, description, items, currency, budget_public, total_budget, end_date, delivery_days, delivery_method, delivery_provinsi, delivery_city, delivery_address, delivery_address_detail, delivery_lat, delivery_lng, delivery_timing_mode, delivery_deadline_date, attachments, contact_name, contact_phone, status, created_at, user_id",
		)
		.eq("id", id)
		.single();

	if (error || !data) return null;
	if (data.user_id !== user.id) return null;

	return {
		id: data.id,
		title: data.title,
		category: data.category,
		description: data.description ?? "",
		items: data.items ?? [],
		currency: data.currency,
		budgetPublic: data.budget_public ?? false,
		totalBudget: Number(data.total_budget ?? 0),
		endDate: data.end_date,
		deliveryDays: data.delivery_days ?? 0,
		deliveryMethod: data.delivery_method ?? "negotiate",
		deliveryProvinsi: data.delivery_provinsi ?? "",
		deliveryCity: data.delivery_city ?? "",
		deliveryAddress: data.delivery_address ?? "",
		deliveryAddressDetail: data.delivery_address_detail ?? "",
		deliveryLat: data.delivery_lat !== null ? Number(data.delivery_lat) : null,
		deliveryLng: data.delivery_lng !== null ? Number(data.delivery_lng) : null,
		deliveryTimingMode: data.delivery_timing_mode ?? "negotiate",
		deliveryDeadlineDate: data.delivery_deadline_date ?? null,
		attachments: data.attachments ?? [],
		contactName: data.contact_name ?? "",
		contactPhone: data.contact_phone ?? "",
		status: data.status ?? "active",
		createdAt: data.created_at,
	};
}

export async function getBuyerContactInfo(): Promise<{ name: string; phone: string }> {
	const { supabase, user } = await getSessionUser();
	if (!user) return { name: "", phone: "" };

	const { data } = await supabase
		.from("contacts")
		.select("name, mobile")
		.eq("profile_id", user.id)
		.single();

	return {
		name: data?.name ?? "",
		phone: data?.mobile ?? "",
	};
}