import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { SellerDashboardData } from "@/features/seller/types";
import type { MyQuote } from "@/features/seller/types";
import type { ListingDetail, MyQuoteSummary, OpenListing } from "@/features/seller/types";
import type { Currency } from "@/features/buyer/types";
import { getExchangeRates, convertCurrency } from "@/libs/exchangeRate";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";

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

	if (!user) {
		return {
			openListingCount: 0,
			quoteCount: 0,
			pendingQuoteCount: 0,
			awardedQuoteCount: 0,
			contractCount: 0,
			activities: [],
		};
	}

	const [{ count: openListingCount }, { data: quotes }, { count: contractCount }, { data: recentQuotes }] =
		await Promise.all([
			supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
			supabase.from("quotes").select("status").eq("seller_id", user.id),
			supabase.from("contracts").select("*", { count: "exact", head: true }).eq("seller_id", user.id),
			supabase
				.from("quotes")
				.select("status, created_at, listings(title, title_source_lang, title_translations)")
				.eq("seller_id", user.id)
				.order("created_at", { ascending: false })
				.limit(5),
		]);

	const quoteCount = quotes?.length ?? 0;
	const pendingQuoteCount = quotes?.filter((q) => q.status === "pending").length ?? 0;
	const awardedQuoteCount = quotes?.filter((q) => q.status === "awarded").length ?? 0;

	const [t, tRelative, locale] = await Promise.all([
		getTranslations("SellerDashboardData"),
		getTranslations("RelativeTime"),
		getLocale(),
	]);

	const activities = (recentQuotes ?? []).map((row) => {
		const listing = row.listings as unknown as {
			title: string;
			title_source_lang: string | null;
			title_translations: Record<string, string> | null;
		} | null;
		const listingTitle = listing
			? resolveTranslatedField(listing.title, listing.title_source_lang, listing.title_translations, locale)
			: "";
		const title =
			row.status === "awarded"
				? t("contractConfirmedActivity", { title: listingTitle })
				: t("quoteSubmittedActivity", { title: listingTitle });

		return { title, timeText: formatRelativeTime(row.created_at, tRelative) };
	});

	return {
		openListingCount: openListingCount ?? 0,
		quoteCount,
		pendingQuoteCount,
		awardedQuoteCount,
		contractCount: contractCount ?? 0,
		activities,
	};
}

export async function getOpenListings(): Promise<OpenListing[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	const locale = await getLocale();

	const { data, error } = await supabase
		.from("listings")
		.select(
			"id, title, title_source_lang, title_translations, description, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, created_at, status",
		)
		.order("end_date", { ascending: true });

	if (error) throw new Error(error.message);
	if (!data) return [];

	const rates = await getExchangeRates();

	let myQuoteListingIds = new Set<string>();
	if (user) {
		const { data: myQuotes } = await supabase
			.from("quotes")
			.select("listing_id")
			.eq("seller_id", user.id);
		myQuoteListingIds = new Set((myQuotes ?? []).map((q) => q.listing_id));
	}

	return data
		.map((row) => {
			const totalBudget = Number(row.total_budget ?? 0);

			return {
				id: row.id,
				title: resolveTranslatedField(row.title, row.title_source_lang, row.title_translations, locale),
				description: row.description ?? "",
				items: row.items,
				currency: row.currency,
				totalBudget,
				budgetInKrw: convertCurrency(totalBudget, row.currency as Currency, "KRW", rates),
				budgetPublic: row.budget_public ?? false,
				endDate: row.end_date,
				deliveryProvinsi: row.delivery_provinsi ?? "",
				deliveryCity: row.delivery_city ?? "",
				createdAt: row.created_at,
				status: row.status ?? "active",
				hasMyQuote: myQuoteListingIds.has(row.id),
			};
		})
		.sort((a, b) => {
			const aClosed = a.status !== "active" || new Date(a.endDate).getTime() <= Date.now();
			const bClosed = b.status !== "active" || new Date(b.endDate).getTime() <= Date.now();
			if (aClosed !== bClosed) return aClosed ? 1 : -1;
			return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
		});
}

export async function getListingDetail(listingId: string): Promise<ListingDetail | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	const rates = await getExchangeRates();
	const locale = await getLocale();

	const { data, error } = await supabase
		.from("listings")
		.select(
			"id, title, title_source_lang, title_translations, category, description, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, delivery_address, delivery_address_detail, delivery_days, delivery_method, delivery_timing_mode, delivery_deadline_date, delivery_lat, delivery_lng, attachments, created_at, user_id, status",
		)
		.eq("id", listingId)
		.single();

	if (error || !data) return null;

	const { data: company } = await supabase
		.from("companies")
		.select("company_name")
		.eq("profile_id", data.user_id)
		.single();

	let myQuote: MyQuoteSummary | null = null;
	if (user) {
		const { data: quote } = await supabase
			.from("quotes")
			.select("id, price, currency, delivery_days, note, status")
			.eq("listing_id", listingId)
			.eq("seller_id", user.id)
			.maybeSingle();

		if (quote) {
			myQuote = {
				id: quote.id,
				price: Number(quote.price),
				currency: quote.currency as Currency,
				deliveryDays: quote.delivery_days,
				note: quote.note ?? "",
				status: quote.status,
			};
		}
	}

	const totalBudget = Number(data.total_budget ?? 0);

	return {
		id: data.id,
		title: resolveTranslatedField(data.title, data.title_source_lang, data.title_translations, locale),
		description: data.description ?? "",
		items: data.items,
		currency: data.currency,
		totalBudget,
		budgetInKrw: convertCurrency(totalBudget, data.currency as Currency, "KRW", rates),
		budgetPublic: data.budget_public ?? false,
		endDate: data.end_date,
		category: data.category,
		deliveryProvinsi: data.delivery_provinsi ?? "",
		deliveryCity: data.delivery_city ?? "",
		deliveryAddress: data.delivery_address ?? "",
		deliveryAddressDetail: data.delivery_address_detail ?? "",
		deliveryDays: data.delivery_days ?? 0,
		deliveryMethod: data.delivery_method ?? "negotiate",
		deliveryTimingMode: data.delivery_timing_mode ?? "negotiate",
		deliveryDeadlineDate: data.delivery_deadline_date ?? null,
		deliveryLat: data.delivery_lat !== null ? Number(data.delivery_lat) : null,
		deliveryLng: data.delivery_lng !== null ? Number(data.delivery_lng) : null,
		attachments: data.attachments ?? [],
		createdAt: data.created_at,
		status: data.status ?? "active",
		companyName: company?.company_name ?? "",
		myQuote,
		hasMyQuote: myQuote !== null,
	};
}

export async function getMyQuotes(): Promise<MyQuote[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];
	const locale = await getLocale();

	const { data, error } = await supabase
		.from("quotes")
		.select(
			"id, listing_id, price, currency, delivery_days, note, note_source_lang, note_translations, status, created_at, listings(title, title_source_lang, title_translations, end_date, user_id)",
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
			title_source_lang: string | null;
			title_translations: Record<string, string> | null;
			end_date: string;
			user_id: string;
		} | null;
		const listingTitle = listing
			? resolveTranslatedField(listing.title, listing.title_source_lang, listing.title_translations, locale)
			: "";

		return {
			id: row.id,
			listingId: row.listing_id,
			listingTitle,
			buyerCompanyName: companyMap.get(listing?.user_id ?? "") ?? "",
			price: Number(row.price),
			currency: row.currency,
			deliveryDays: row.delivery_days,
			note: resolveTranslatedField(row.note ?? "", row.note_source_lang, row.note_translations, locale),
			status: row.status,
			createdAt: row.created_at,
			listingEndDate: listing?.end_date ?? "",
		};
	});
}

export async function getRecommendedListings(): Promise<OpenListing[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const { data: profile } = await supabase
		.from("company_profiles")
		.select("categories")
		.eq("profile_id", user.id)
		.single();

	const categories = profile?.categories ?? [];
	if (categories.length === 0) return [];

	const { data: myQuotes } = await supabase
		.from("quotes")
		.select("listing_id")
		.eq("seller_id", user.id);

	const quotedIds = (myQuotes ?? []).map((q) => q.listing_id);

	// 마감일이 지났거나 비어 있는 공고는 추천에서 뺀다.
	// end_date 가 null 이면 이 비교가 false 라 자연히 제외된다.
	const today = new Date().toISOString().slice(0, 10);

	const locale = await getLocale();

	let query = supabase
		.from("listings")
		.select(
			"id, title, title_source_lang, title_translations, description, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, created_at",
		)
		.eq("status", "active")
		.gte("end_date", today)
		.in("category", categories)
		.order("end_date", { ascending: true })
		.limit(5);

	if (quotedIds.length > 0) {
		query = query.not("id", "in", `(${quotedIds.join(",")})`);
	}

	const { data, error } = await query;
	if (error) throw new Error(error.message);
	if (!data) return [];

	const rates = await getExchangeRates();

	return data.map((row) => {
		const totalBudget = Number(row.total_budget ?? 0);

		return {
			id: row.id,
			title: resolveTranslatedField(row.title, row.title_source_lang, row.title_translations, locale),
			description: row.description ?? "",
			items: row.items,
			currency: row.currency,
			totalBudget,
			budgetInKrw: convertCurrency(totalBudget, row.currency as Currency, "KRW", rates),
			budgetPublic: row.budget_public ?? false,
			endDate: row.end_date,
			deliveryProvinsi: row.delivery_provinsi ?? "",
			deliveryCity: row.delivery_city ?? "",
			createdAt: row.created_at,
			status: "active" as const,
			hasMyQuote: false,
		};
	});
}