import { cache } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type {
	ListingWithQuotes,
	ReceivedQuote,
	ListingSummary,
	BuyerDashboardData,
	BuyerTradeSummary,
	BuyerTodo,
	BuyerActivity,
	ListingFormData,
	ListingStatus,
	Currency,
} from "@/features/buyer/types";
import { getExchangeRates, convertCurrency } from "@/libs/exchangeRate";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";

// 서버의 getSession()은 쿠키를 검증 없이 읽으므로 인가 판단에 쓰면 안 된다.
// getUser()는 매 호출이 인증 서버 왕복이라, 같은 요청 안에서는 cache()로 한 번만 조회한다.
async function fetchSessionUser() {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return { supabase, user };
}

const getSessionUser = cache(fetchSessionUser);

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
	const [t, tRelative, locale] = await Promise.all([
		getTranslations("BuyerDashboardData"),
		getTranslations("RelativeTime"),
		getLocale(),
	]);

	const empty: BuyerDashboardData = {
		listingCount: 0,
		todos: [],
		savings: { totalAmount: 0, completedCount: 0 },
		badges: { quotes: 0, chats: 0 },
		activities: [],
	};

	if (!user) return empty;

	const [{ data: listings }, { data: recentNotifications }, { data: awaitingReceiptContracts }] =
		await Promise.all([
			supabase
				.from("listings")
				.select(
					"id, title, title_source_lang, title_translations, status, currency, end_date, quotes(id, price)",
				)
				.eq("user_id", user.id),
			supabase
				.from("notifications")
				.select(
					"id, type, quote_id, title, title_source_lang, title_translations, content, content_source_lang, content_translations, created_at",
				)
				.eq("profile_id", user.id)
				.order("created_at", { ascending: false })
				.limit(5),
			supabase
				.from("contracts")
				.select(
					"id, listing_id, created_at, listings(title, title_source_lang, title_translations)",
				)
				.eq("buyer_id", user.id)
				.eq("status", "ongoing")
				.is("payment_receipt_url", null),
		]);

	const listingRows = listings ?? [];

	// 견적 id는 위 listings 조회에 이미 임베드돼 있으므로 별도 쿼리를 만들지 않는다.
	const quoteIds = listingRows.flatMap((row) =>
		((row.quotes as unknown as { id: string }[]) ?? []).map((q) => q.id),
	);

	// "받은 견적" 배지는 안읽은 알림 수가 아니라, 진행중 공고에 실제로 달린 견적 수를 보여준다.
	// (알림을 다 읽으면 0이 되어 "받은 견적이 없다"처럼 보이던 문제)
	// status가 "active"라도 마감일이 지났거나 마감일이 없는 공고는 할 일 목록과 기준을 맞춰 집계에서 뺀다.
	const now = Date.now();
	const activeQuoteCount = listingRows
		.filter(
			(row) =>
				row.status === "active" && row.end_date !== null && new Date(row.end_date).getTime() > now,
		)
		.reduce((sum, row) => sum + ((row.quotes as unknown as { id: string }[]) ?? []).length, 0);

	const { count: unreadChatCount } =
		quoteIds.length > 0
			? await supabase
					.from("messages")
					.select("*", { count: "exact", head: true })
					.in("quote_id", quoteIds)
					.eq("is_read", false)
					.neq("sender_id", user.id)
			: { count: 0 };

	type TodoEntry = { todo: BuyerTodo; isUrgent: boolean; sortTime: number };

	const quoteTodoEntries: TodoEntry[] = listingRows
		.filter((row) => row.status === "active" && row.end_date !== null)
		.map((row) => ({
			row,
			quotes: (row.quotes as unknown as { price: number }[]) ?? [],
		}))
		.filter(({ quotes }) => quotes.length > 0)
		.map(({ row, quotes }) => {
			const lowestPrice = Math.min(...quotes.map((q) => Number(q.price)));
			const symbol = CURRENCY_SYMBOL[row.currency as Currency];
			const sortTime = new Date(row.end_date).getTime();
			const daysLeft = Math.ceil((sortTime - Date.now()) / (1000 * 60 * 60 * 24));
			// 이미 마감된 공고에 "D-0"/"D--2" 뱃지가 붙지 않도록 남은 일수가 있을 때만 긴급 처리
			const isUrgent = daysLeft > 0 && daysLeft <= 3;

			return {
				isUrgent,
				sortTime,
				todo: {
					id: row.id,
					kind: "quotePending",
					listingId: row.id,
					contractId: null,
					title: resolveTranslatedField(
						row.title,
						row.title_source_lang,
						row.title_translations,
						locale,
					),
					description: t("quotesSummary", {
						count: quotes.length,
						price: `${symbol}${lowestPrice.toLocaleString()}`,
					}),
					deadlineText: daysLeft > 0 ? t("deadlineDays", { days: daysLeft }) : t("deadlineClosed"),
					dueTime: new Date(sortTime).toISOString(),
					actionLabel: t("compareAction"),
					highlights: isUrgent ? [{ label: t("urgentLabel"), value: `D-${daysLeft}` }] : [],
				} satisfies BuyerTodo,
			};
		});

	// 결제 대기 — 계약은 확정됐지만 아직 영수증을 업로드하지 않은 건. 경과일이 곧 "얼마나
	// 미뤄뒀는지"라 긴급 판단 기준도 남은 일수가 아니라 경과일이다.
	const paymentTodoEntries: TodoEntry[] = (awaitingReceiptContracts ?? []).map((row) => {
		const listing = row.listings as unknown as {
			title: string;
			title_source_lang: string | null;
			title_translations: Record<string, string> | null;
		} | null;
		const createdTime = new Date(row.created_at).getTime();
		const elapsedDays = Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24));
		const isUrgent = elapsedDays >= 3;

		return {
			isUrgent,
			sortTime: createdTime,
			todo: {
				id: `payment-${row.id}`,
				kind: "paymentPending",
				listingId: row.listing_id,
				contractId: row.id,
				title: listing
					? resolveTranslatedField(
							listing.title,
							listing.title_source_lang,
							listing.title_translations,
							locale,
						)
					: "",
				description: t("paymentPendingDescription"),
				deadlineText:
					elapsedDays === 0
						? t("paymentJustConfirmed")
						: t("paymentElapsedDays", { days: elapsedDays }),
				dueTime: new Date(createdTime).toISOString(),
				actionLabel: t("uploadReceiptAction"),
				highlights: isUrgent
					? [
							{
								label: t("paymentUrgentLabel"),
								value: t("paymentElapsedDays", { days: elapsedDays }),
							},
						]
					: [],
			} satisfies BuyerTodo,
		};
	});

	// 두 종류를 합쳐 긴급 항목을 먼저, 그 안에서는 각자 기준 시각(공고 마감일/계약 확정일)
	// 오름차순으로 정렬한다 — 견적 항목만 있던 기존 동작과 동일한 순서를 유지한다.
	const todos: BuyerTodo[] = [...quoteTodoEntries, ...paymentTodoEntries]
		.sort((a, b) => {
			if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
			return a.sortTime - b.sortTime;
		})
		.slice(0, 5)
		.map((entry) => entry.todo);

	const activities: BuyerActivity[] = (recentNotifications ?? []).map((row) => ({
		id: row.id,
		type: row.type === "quote" ? "quote" : row.type === "award" ? "award" : "document",
		quoteId: row.quote_id,
		title: resolveTranslatedField(row.title, row.title_source_lang, row.title_translations, locale),
		description: resolveTranslatedField(
			row.content,
			row.content_source_lang,
			row.content_translations,
			locale,
		),
		timeText: formatRelativeTime(row.created_at, tRelative),
	}));

	return {
		listingCount: listingRows.length,
		todos,
		// 대시보드 UI에 절약금액 카드가 아직 없어 계산 기준을 정하지 않았다. 필요해지면 채운다.
		savings: { totalAmount: 0, completedCount: 0 },
		badges: { quotes: activeQuoteCount, chats: unreadChatCount ?? 0 },
		activities,
	};
}

export async function getBuyerTradeSummary(): Promise<BuyerTradeSummary> {
	const { supabase, user } = await getSessionUser();
	const t = await getTranslations("BuyerDashboardData");

	const empty: BuyerTradeSummary = {
		inProgress: {
			total: 0,
			subItems: [
				{ label: t("quoteLabel"), value: 0 },
				{ label: t("listingLabel"), value: 0 },
			],
		},
		closed: {
			total: 0,
			subItems: [
				{ label: t("quoteLabel"), value: 0 },
				{ label: t("listingLabel"), value: 0 },
			],
		},
		contracts: {
			total: 0,
			subItems: [
				{ label: t("pendingPaymentLabel"), value: 0 },
				{ label: t("confirmedPaymentLabel"), value: 0 },
			],
		},
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

	// 두 쿼리는 서로 독립이므로 병렬로 조회한다.
	const [quotesResult, contractsResult] = await Promise.all([
		allListingIds.length > 0
			? supabase.from("quotes").select("listing_id").in("listing_id", allListingIds)
			: Promise.resolve({ data: [] as { listing_id: string }[], error: null }),
		supabase.from("contracts").select("payment_confirmed_at").eq("buyer_id", user.id),
	]);

	if (quotesResult.error) throw new Error(quotesResult.error.message);
	if (contractsResult.error) throw new Error(contractsResult.error.message);

	const activeIdSet = new Set(activeListingIds);
	const closedIdSet = new Set(closedListingIds);
	const activeQuoteCount = (quotesResult.data ?? []).filter((q) =>
		activeIdSet.has(q.listing_id),
	).length;
	const closedQuoteCount = (quotesResult.data ?? []).filter((q) =>
		closedIdSet.has(q.listing_id),
	).length;

	const contracts = contractsResult.data;

	const pendingCount = (contracts ?? []).filter((c) => !c.payment_confirmed_at).length;
	const confirmedCount = (contracts ?? []).filter((c) => c.payment_confirmed_at).length;

	return {
		inProgress: {
			total: activeListingIds.length,
			subItems: [
				{ label: t("quoteLabel"), value: activeQuoteCount },
				{ label: t("listingLabel"), value: activeListingIds.length },
			],
		},
		closed: {
			total: closedListingIds.length,
			subItems: [
				{ label: t("quoteLabel"), value: closedQuoteCount },
				{ label: t("listingLabel"), value: closedListingIds.length },
			],
		},
		contracts: {
			total: (contracts ?? []).length,
			subItems: [
				{ label: t("pendingPaymentLabel"), value: pendingCount },
				{ label: t("confirmedPaymentLabel"), value: confirmedCount },
			],
		},
	};
}

export async function getBuyerListings(): Promise<ListingSummary[]> {
	const { supabase, user } = await getSessionUser();
	if (!user) return [];
	const locale = await getLocale();

	const { data, error } = await supabase
		.from("listings")
		.select(
			"id, title, title_source_lang, title_translations, items, currency, total_budget, budget_public, end_date, status, created_at, category",
		)
		.eq("user_id", user.id)
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);

	const listingIds = (data ?? []).map((row) => row.id);

	const [{ data: quoteRows, error: quoteError }, { data: bookmarkRows, error: bookmarkError }] =
		await Promise.all([
			supabase.from("quotes").select("listing_id, status").in("listing_id", listingIds),
			supabase.from("listing_bookmarks").select("listing_id").in("listing_id", listingIds),
		]);

	if (quoteError) throw new Error(quoteError.message);
	if (bookmarkError) throw new Error(bookmarkError.message);

	const quoteCountMap = new Map<string, number>();
	const awardedListingIds = new Set<string>();
	for (const row of quoteRows ?? []) {
		quoteCountMap.set(row.listing_id, (quoteCountMap.get(row.listing_id) ?? 0) + 1);
		if (row.status === "awarded") {
			awardedListingIds.add(row.listing_id);
		}
	}

	const bookmarkCountMap = new Map<string, number>();
	for (const row of bookmarkRows ?? []) {
		bookmarkCountMap.set(row.listing_id, (bookmarkCountMap.get(row.listing_id) ?? 0) + 1);
	}

	return (data ?? []).map((row) => {
		const rawStatus = row.status ?? "active";
		const status = rawStatus === "closed" && awardedListingIds.has(row.id) ? "awarded" : rawStatus;

		return {
			id: row.id,
			title: resolveTranslatedField(
				row.title,
				row.title_source_lang,
				row.title_translations,
				locale,
			),
			items: row.items,
			currency: row.currency,
			totalBudget: Number(row.total_budget ?? 0),
			budgetPublic: row.budget_public ?? false,
			endDate: row.end_date,
			status,
			createdAt: row.created_at,
			category: row.category,
			quoteCount: quoteCountMap.get(row.id) ?? 0,
			bookmarkCount: bookmarkCountMap.get(row.id) ?? 0,
		};
	});
}

export async function getListingsWithQuoteCount(): Promise<ListingWithQuotes[]> {
	const { supabase, user } = await getSessionUser();
	if (!user) return [];
	const locale = await getLocale();

	const { data, error } = await supabase
		.from("listings")
		.select(
			"id, title, title_source_lang, title_translations, end_date, status, currency, created_at, category, total_budget, quotes(price, delivery_days, status)",
		)
		.eq("user_id", user.id)
		.order("end_date", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => {
		const quotes =
			(row.quotes as unknown as { price: number; delivery_days: number; status: string }[]) ?? [];
		const rawStatus = row.status ?? "active";
		const isAwarded = quotes.some((q) => q.status === "awarded");
		const status = rawStatus === "closed" && isAwarded ? "awarded" : rawStatus;

		return {
			id: row.id,
			title: resolveTranslatedField(
				row.title,
				row.title_source_lang,
				row.title_translations,
				locale,
			),
			endDate: row.end_date,
			status,
			currency: row.currency,
			category: row.category,
			totalBudget: row.total_budget !== null ? Number(row.total_budget) : null,
			quoteCount: quotes.length,
			lowestPrice: quotes.length > 0 ? Math.min(...quotes.map((q) => Number(q.price))) : null,
			fastestDays: quotes.length > 0 ? Math.min(...quotes.map((q) => q.delivery_days)) : null,
			createdAt: row.created_at,
		};
	});
}

/** 견적 비교 페이지 헤더용 — 공고 하나의 제목만 가볍게 조회한다. */
export async function getListingTitle(listingId: string): Promise<string | null> {
	const { supabase, user } = await getSessionUser();
	if (!user) return null;

	const locale = await getLocale();

	const { data } = await supabase
		.from("listings")
		.select("title, title_source_lang, title_translations, user_id")
		.eq("id", listingId)
		.single();

	if (!data || data.user_id !== user.id) return null;

	return resolveTranslatedField(
		data.title,
		data.title_source_lang,
		data.title_translations,
		locale,
	);
}

export async function getQuotesByListing(listingId: string): Promise<ReceivedQuote[]> {
	const { supabase, user } = await getSessionUser();
	if (!user) return [];

	// 판매사 정보는 RLS를 우회하는 admin 클라이언트로 조회하므로,
	// 호출자가 이 공고의 소유자인지 여기서 직접 확인해야 한다.
	const { data: listing } = await supabase
		.from("listings")
		.select("user_id")
		.eq("id", listingId)
		.single();

	if (!listing || listing.user_id !== user.id) return [];

	const { createServerAdminClient } = await import("@/libs/supabaseServer");
	const admin = await createServerAdminClient();
	const locale = await getLocale();

	const { data, error } = await supabase
		.from("quotes")
		.select(
			"id, listing_id, seller_id, price, currency, delivery_days, note, note_source_lang, note_translations, status, created_at, previous_price, previous_delivery_days, revised_at, items, attachments, payment_terms",
		)
		.eq("listing_id", listingId)
		.order("price", { ascending: true });

	if (error) throw new Error(error.message);
	if (!data || data.length === 0) return [];

	const sellerIds = data.map((row) => row.seller_id);

	// 네 조회는 서로 독립이므로 병렬로 실행한다.
	const [{ data: companies }, { data: profiles }, { data: reviews }, rates] = await Promise.all([
		admin
			.from("companies")
			.select(
				"profile_id, company_name, representative, address, business_type, business_type_source_lang, business_type_translations, business_item, business_item_source_lang, business_item_translations, verification_status",
			)
			.in("profile_id", sellerIds),
		admin.from("company_profiles").select("profile_id, logo_url").in("profile_id", sellerIds),
		admin.from("reviews").select("reviewee_id, rating").in("reviewee_id", sellerIds),
		getExchangeRates(),
	]);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c]));
	const profileMap = new Map((profiles ?? []).map((p) => [p.profile_id, p]));

	const ratingSums = new Map<string, { sum: number; count: number }>();
	for (const review of reviews ?? []) {
		const entry = ratingSums.get(review.reviewee_id) ?? { sum: 0, count: 0 };
		entry.sum += review.rating;
		entry.count += 1;
		ratingSums.set(review.reviewee_id, entry);
	}

	return data.map((row) => {
		const company = companyMap.get(row.seller_id);
		const profile = profileMap.get(row.seller_id);
		const price = Number(row.price);
		const ratingStats = ratingSums.get(row.seller_id);

		return {
			id: row.id,
			listingId: row.listing_id,
			price,
			currency: row.currency,
			priceInIdr: convertCurrency(price, row.currency, "IDR", rates),
			deliveryDays: row.delivery_days,
			note: resolveTranslatedField(
				row.note ?? "",
				row.note_source_lang,
				row.note_translations,
				locale,
			),
			status: row.status,
			createdAt: row.created_at,
			previousPrice: row.previous_price !== null ? Number(row.previous_price) : null,
			previousDeliveryDays: row.previous_delivery_days,
			revisedAt: row.revised_at,
			items: row.items ?? [],
			attachments: row.attachments ?? [],
			paymentTerms: row.payment_terms,
			seller: {
				profileId: row.seller_id,
				companyName: company?.company_name ?? "",
				representative: company?.representative ?? "",
				address: company?.address ?? "",
				businessType: company
					? resolveTranslatedField(
							company.business_type ?? "",
							company.business_type_source_lang,
							company.business_type_translations,
							locale,
						)
					: "",
				businessItem: company
					? resolveTranslatedField(
							company.business_item ?? "",
							company.business_item_source_lang,
							company.business_item_translations,
							locale,
						)
					: "",
				verificationStatus: company?.verification_status ?? "unverified",
				logoUrl: profile?.logo_url ?? null,
				ratingAverage: ratingStats
					? Math.round((ratingStats.sum / ratingStats.count) * 10) / 10
					: null,
				ratingCount: ratingStats?.count ?? 0,
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

	const rawStatus = data.status ?? "active";
	let status: ListingStatus = rawStatus;
	if (rawStatus === "closed") {
		const { data: quoteRows } = await supabase
			.from("quotes")
			.select("status")
			.eq("listing_id", id)
			.eq("status", "awarded")
			.limit(1);
		if (quoteRows && quoteRows.length > 0) status = "awarded";
	}

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
		status,
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
