import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { SellerDashboardData, SellerTodo } from "@/features/seller/types";
import type { MyQuote } from "@/features/seller/types";
import type { ListingDetail, MyQuoteSummary, OpenListing } from "@/features/seller/types";
import type { Currency, ListingItem } from "@/features/buyer/types";
import { getExchangeRates, convertCurrency } from "@/libs/exchangeRate";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import { htmlToPlainText } from "@/utils/htmlToPlainText";

// 목록 카드 미리보기용 설명 길이 — 상세 페이지(getListingDetail)는 전문을 그대로 쓴다.
const DESCRIPTION_PREVIEW_LENGTH = 500;

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

const DAY_MS = 1000 * 60 * 60 * 24;

type SellerTodoEntry = {
	todo: SellerTodo;
	// 0=긴급(빨강), 1=신규(파랑, awarded 전용), 2=평시 — 낮은 값이 먼저 온다.
	tier: number;
	// 같은 tier 안에서는 이 값 오름차순 정렬(마감/납품예정/경과 모두 "이 시각 기준으로 급함" 의미로 통일).
	sortTime: number;
};

// 바이어 대시보드의 "할 일"과 같은 UX로, 셀러가 지금 처리해야 할 4종(견적 응답 대기/신규 계약/
// 납품 임박/입금 확인 대기)을 한 목록으로 합쳐 상위 5개만 보여준다.
export async function getSellerTodos(): Promise<SellerTodo[]> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return [];

	const [t, locale] = await Promise.all([getTranslations("SellerDashboardData"), getLocale()]);
	const now = Date.now();

	const [{ data: pendingQuotes }, { data: ongoingContracts }] = await Promise.all([
		supabase
			.from("quotes")
			.select("id, listing_id, listings(title, title_source_lang, title_translations, end_date)")
			.eq("seller_id", user.id)
			.eq("status", "pending"),
		supabase
			.from("contracts")
			.select(
				"id, listing_id, created_at, payment_receipt_url, payment_confirmed_at, delivery_confirmed_at, listings(title, title_source_lang, title_translations), quotes(delivery_days)",
			)
			.eq("seller_id", user.id)
			.eq("status", "ongoing"),
	]);

	const entries: SellerTodoEntry[] = [];

	// 1. quotePending — 제출한 견적에 대한 응답 대기, 공고 마감 임박순
	for (const row of pendingQuotes ?? []) {
		const listing = row.listings as unknown as {
			title: string;
			title_source_lang: string | null;
			title_translations: Record<string, string> | null;
			end_date: string | null;
		} | null;
		// 마감일 없는 공고는 바이어 todos와 동일하게 대상에서 뺀다(임박 판단 기준이 없음).
		if (!listing || !listing.end_date) continue;

		const endTime = new Date(listing.end_date).getTime();
		const daysLeft = Math.ceil((endTime - now) / DAY_MS);
		const isUrgent = daysLeft > 0 && daysLeft <= 3;

		entries.push({
			tier: isUrgent ? 0 : 2,
			sortTime: endTime,
			todo: {
				id: `quote-${row.id}`,
				kind: "quotePending",
				listingId: row.listing_id,
				contractId: null,
				title: resolveTranslatedField(listing.title, listing.title_source_lang, listing.title_translations, locale),
				description: t("quotePendingDescription"),
				deadlineText: daysLeft > 0 ? t("quoteDeadlineDays", { days: daysLeft }) : t("quoteDeadlineClosed"),
				actionLabel: t("quoteAction"),
				highlights: isUrgent ? [{ label: t("quoteUrgentLabel"), value: `D-${daysLeft}` }] : [],
			},
		});
	}

	for (const row of ongoingContracts ?? []) {
		const listing = row.listings as unknown as {
			title: string;
			title_source_lang: string | null;
			title_translations: Record<string, string> | null;
		} | null;
		const quote = row.quotes as unknown as { delivery_days: number } | null;
		const title = listing
			? resolveTranslatedField(listing.title, listing.title_source_lang, listing.title_translations, locale)
			: "";
		const createdTime = new Date(row.created_at).getTime();
		// 영수증 업로드 시각을 별도로 저장하지 않아(스키마에 컬럼 없음), 입금 확인 대기 항목의
		// "경과일"도 계약 확정 시각(created_at) 기준으로 근사한다.
		const ageDays = Math.floor((now - createdTime) / DAY_MS);

		// 2. awarded — 신규 계약 확인(확정 3일 이내인 동안만 노출)
		if (ageDays <= 3) {
			entries.push({
				tier: 1,
				sortTime: createdTime,
				todo: {
					id: `awarded-${row.id}`,
					kind: "awarded",
					listingId: row.listing_id,
					contractId: row.id,
					title,
					description: t("awardedDescription"),
					deadlineText: ageDays === 0 ? t("awardedToday") : t("awardedDaysAgo", { days: ageDays }),
					actionLabel: t("awardedAction"),
					highlights: [],
				},
			});
		}

		// 3. deliveryDue — 납품 예정일(계약 확정일 + 견적 납기일수) 임박/지연
		if (!row.delivery_confirmed_at && quote) {
			const dueTime = createdTime + quote.delivery_days * DAY_MS;
			const daysLeft = Math.ceil((dueTime - now) / DAY_MS);
			// 지연(daysLeft<=0)도 계속 노출하고 긴급으로 취급한다 — 임박 확인용 위젯이라 숨기면 안 됨.
			const isUrgent = daysLeft <= 3;

			entries.push({
				tier: isUrgent ? 0 : 2,
				sortTime: dueTime,
				todo: {
					id: `delivery-${row.id}`,
					kind: "deliveryDue",
					listingId: row.listing_id,
					contractId: row.id,
					title,
					description: t("deliveryDueDescription"),
					deadlineText:
						daysLeft > 0
							? t("deliveryDueDays", { days: daysLeft })
							: daysLeft === 0
								? t("deliveryDueToday")
								: t("deliveryOverdueDays", { days: -daysLeft }),
					actionLabel: t("deliveryAction"),
					highlights: isUrgent
						? [{ label: t("deliveryUrgentLabel"), value: daysLeft >= 0 ? `D-${daysLeft}` : `D+${-daysLeft}` }]
						: [],
				},
			});
		}

		// 4. paymentConfirm — 바이어가 영수증을 올렸는데 아직 입금 확인 전
		if (row.payment_receipt_url && !row.payment_confirmed_at) {
			const isUrgent = ageDays >= 2;

			entries.push({
				tier: isUrgent ? 0 : 2,
				sortTime: createdTime,
				todo: {
					id: `payment-${row.id}`,
					kind: "paymentConfirm",
					listingId: row.listing_id,
					contractId: row.id,
					title,
					description: t("paymentConfirmDescription"),
					deadlineText: ageDays === 0 ? t("paymentConfirmToday") : t("paymentConfirmElapsedDays", { days: ageDays }),
					actionLabel: t("paymentConfirmAction"),
					highlights: isUrgent
						? [{ label: t("paymentConfirmUrgentLabel"), value: t("paymentConfirmElapsedDays", { days: ageDays }) }]
						: [],
				},
			});
		}
	}

	return entries
		.sort((a, b) => (a.tier !== b.tier ? a.tier - b.tier : a.sortTime - b.sortTime))
		.slice(0, 5)
		.map((entry) => entry.todo);
}

export async function getOpenListings(): Promise<OpenListing[]> {
	const supabase = await createServerSupabaseClient();

	const [{ data: { user } }, locale, { data, error }, rates] = await Promise.all([
		supabase.auth.getUser(),
		getLocale(),
		supabase
			.from("listings")
			.select(
				"id, title, title_source_lang, title_translations, description, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, created_at, status",
			)
			.order("end_date", { ascending: true }),
		getExchangeRates(),
	]);

	if (error) throw new Error(error.message);
	if (!data) return [];

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
				description: htmlToPlainText(row.description ?? "", DESCRIPTION_PREVIEW_LENGTH),
				items: ((row.items ?? []) as ListingItem[]).map((item) => ({
					name: item.name,
					spec: item.spec,
				})),
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

	const [{ data: { user } }, rates, locale, { data, error }] = await Promise.all([
		supabase.auth.getUser(),
		getExchangeRates(),
		getLocale(),
		supabase
			.from("listings")
			.select(
				"id, title, title_source_lang, title_translations, category, description, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, delivery_address, delivery_address_detail, delivery_days, delivery_method, delivery_timing_mode, delivery_deadline_date, delivery_lat, delivery_lng, attachments, created_at, user_id, status",
			)
			.eq("id", listingId)
			.single(),
	]);

	if (error || !data) return null;

	const [{ data: company }, { data: quote }] = await Promise.all([
		supabase.from("companies").select("company_name").eq("profile_id", data.user_id).single(),
		user
			? supabase
					.from("quotes")
					.select("id, price, currency, delivery_days, note, status, items, attachments, payment_terms")
					.eq("listing_id", listingId)
					.eq("seller_id", user.id)
					.maybeSingle()
			: Promise.resolve({ data: null }),
	]);

	let myQuote: MyQuoteSummary | null = null;
	if (quote) {
		myQuote = {
			id: quote.id,
			price: Number(quote.price),
			currency: quote.currency as Currency,
			deliveryDays: quote.delivery_days,
			note: quote.note ?? "",
			status: quote.status,
			items: quote.items ?? [],
			attachments: quote.attachments ?? [],
			paymentTerms: quote.payment_terms,
		};
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
	const [{ data: { user } }, locale] = await Promise.all([supabase.auth.getUser(), getLocale()]);
	if (!user) return [];

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
	const [{ data: { user } }, locale] = await Promise.all([supabase.auth.getUser(), getLocale()]);
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

	const [{ data, error }, rates] = await Promise.all([query, getExchangeRates()]);
	if (error) throw new Error(error.message);
	if (!data) return [];

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