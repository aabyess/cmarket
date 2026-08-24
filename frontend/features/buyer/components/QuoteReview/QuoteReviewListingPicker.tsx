"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Mail, Clock, CalendarDays, TrendingDown, Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePersistentState } from "@/hooks/usePersistentState";
import { getCategoryLabels } from "@/features/buyer/constants";
import {
	QuoteReviewFilterBar,
	type QuoteHasFilter,
	type QuoteSortOption,
} from "@/features/buyer/components/QuoteReview/QuoteReviewFilterBar";
import { QuoteReviewListingTable } from "@/features/buyer/components/QuoteReview/QuoteReviewListingTable";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import { Pagination } from "@/components/commons/Pagination";
import type { Currency, ListingWithQuotes } from "@/features/buyer/types";

type QuoteReviewListingPickerPrefs = {
	sort: QuoteSortOption;
	hasFilter: QuoteHasFilter;
	viewMode: ViewMode;
	pageSize: number;
};

const DEFAULT_PREFS: QuoteReviewListingPickerPrefs = {
	sort: "deadline",
	hasFilter: "all",
	viewMode: "list",
	pageSize: 10,
};

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemaining(endDate: string): { days: number; isUrgent: boolean; isClosed: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { days: 0, isUrgent: false, isClosed: true };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { days, isUrgent: days <= 3, isClosed: false };
}

type QuoteReviewListingPickerProps = {
	listings: ListingWithQuotes[];
};

export function QuoteReviewListingPicker({ listings }: QuoteReviewListingPickerProps): React.ReactNode {
	const t = useTranslations("QuoteReviewListingPicker");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));
	const locale = useLocale();
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [prefs, setPrefs] = usePersistentState<QuoteReviewListingPickerPrefs>(
		"mitrapay:buyer-quote-review",
		DEFAULT_PREFS,
	);
	const { sort, hasFilter, viewMode, pageSize } = prefs;
	const [page, setPage] = useState(1);

	function setSort(sort: QuoteSortOption): void {
		setPrefs((prev) => ({ ...prev, sort }));
	}

	function setHasFilter(hasFilter: QuoteHasFilter): void {
		setPrefs((prev) => ({ ...prev, hasFilter }));
	}

	function setViewMode(viewMode: ViewMode): void {
		setPrefs((prev) => ({ ...prev, viewMode }));
	}

	function setPageSize(pageSize: number): void {
		setPrefs((prev) => ({ ...prev, pageSize }));
	}

	const hasFilterCounts = useMemo(() => {
		const counts: Record<QuoteHasFilter, number> = { all: listings.length, has: 0, none: 0 };
		for (const listing of listings) {
			if (listing.quoteCount > 0) counts.has += 1;
			else counts.none += 1;
		}
		return counts;
	}, [listings]);

	const filteredListings = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		const filtered = listings.filter((listing) => {
			if (hasFilter === "has" && listing.quoteCount === 0) return false;
			if (hasFilter === "none" && listing.quoteCount > 0) return false;
			if (!keyword) return true;
			return listing.title.toLowerCase().includes(keyword);
		});

		return [...filtered].sort((a, b) => {
			switch (sort) {
				case "newest":
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case "quoteCount":
					return b.quoteCount - a.quoteCount;
				case "lowestPrice": {
					if (a.lowestPrice === null && b.lowestPrice === null) return 0;
					if (a.lowestPrice === null) return 1;
					if (b.lowestPrice === null) return -1;
					return a.lowestPrice - b.lowestPrice;
				}
				case "deadline":
				default: {
					const aClosed = getRemaining(a.endDate).isClosed;
					const bClosed = getRemaining(b.endDate).isClosed;
					if (aClosed !== bClosed) return aClosed ? 1 : -1;
					return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
				}
			}
		});
	}, [listings, search, sort, hasFilter]);

	useEffect(() => {
		setPage(1);
	}, [search, sort, hasFilter, pageSize]);

	const pageCount = Math.max(1, Math.ceil(filteredListings.length / pageSize));
	const paginatedListings = filteredListings.slice((page - 1) * pageSize, page * pageSize);

	if (listings.length === 0) {
		return (
			<div className="border-hairline rounded-2xl border bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Mail size={26} className="text-subtle" />
				</div>
				<p className="text-base font-medium text-ink">{t("emptyTitle")}</p>
				<p className="mt-1 text-sm text-muted">
					{t("emptyDescription")}
				</p>
				<button
					onClick={() => router.push("/buyer/post-listing")}
					className="mt-5 rounded-lg bg-imsg-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
				>
					{t("emptyAction")}
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-4 flex items-center justify-between gap-2">
				<QuoteReviewFilterBar
					search={search}
					onSearchChange={setSearch}
					sort={sort}
					onSortChange={setSort}
					hasFilter={hasFilter}
					onHasFilterChange={setHasFilter}
					hasFilterCounts={hasFilterCounts}
				/>
				<ViewModeToggle value={viewMode} onChange={setViewMode} />
			</div>

			{filteredListings.length === 0 ? (
				<div className="border-hairline rounded-2xl border bg-white p-12 text-center">
					<p className="text-ink text-sm font-medium">{t("noResultsTitle")}</p>
					<p className="text-muted mt-1 text-sm">{t("noResultsDescription")}</p>
				</div>
			) : (
				// 그리드↔테이블 전환 시 상태 배지(낙찰/마감 칩)가 이전 위치에서 새 위치로
				// 이동하는 느낌을 주기 위해 같은 layoutId를 공유한다(#161과 동일 패턴).
				<LayoutGroup id="quote-review-listing-picker">
					<AnimatePresence mode="popLayout" initial={false}>
						{viewMode === "list" ? (
							<motion.div
								key="table"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								<QuoteReviewListingTable listings={paginatedListings} />
							</motion.div>
						) : (
							<motion.div
								key="grid"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="grid grid-cols-1 gap-3 md:grid-cols-2"
							>
								{paginatedListings.map((listing) => {
						const remaining = getRemaining(listing.endDate);
						const symbol = CURRENCY_SYMBOL[listing.currency];
						const hasQuotes = listing.quoteCount > 0;
						const isAwarded = listing.status === "awarded";

						return (
							<button
								key={listing.id}
								onClick={() => router.push(`/buyer/quote-review?listingId=${listing.id}`)}
								className={cn(
									"flex flex-col rounded-2xl border bg-white p-4 text-left transition-all",
									hasQuotes
										? "border-hairline hover:border-[#BFDBFE] hover:shadow-sm"
										: "border-[#F3F4F6] opacity-60 hover:opacity-100",
								)}
							>
								<div className="mb-2 flex items-start justify-between gap-2">
									<div className="flex flex-wrap items-center gap-1.5">
										{isAwarded ? (
											<motion.span
												layoutId={`quote-review-listing-status-${listing.id}`}
												transition={{ type: "spring", stiffness: 300, damping: 30 }}
												className="flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]"
											>
												<CheckCircle2 size={11} />
												{t("awardedBadge")}
											</motion.span>
										) : (
											<motion.span
												layoutId={`quote-review-listing-status-${listing.id}`}
												transition={{ type: "spring", stiffness: 300, damping: 30 }}
												className={cn(
													"flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
													remaining.isClosed
														? "bg-[#F3F4F6] text-muted"
														: remaining.isUrgent
															? "bg-[#FEF2F2] text-[#DC2626]"
															: "bg-[#EFF6FF] text-imsg-blue",
												)}
											>
												<Clock size={11} />
												{remaining.isClosed ? t("closed") : t("deadlineDays", { days: remaining.days })}
											</motion.span>
										)}
										<span className="whitespace-nowrap rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-muted">
											{categoryLabels[listing.category]}
										</span>
									</div>

									{hasQuotes && (
										<span className="shrink-0 whitespace-nowrap rounded-full bg-imsg-blue px-2 py-0.5 text-xs font-semibold text-white">
											{t("quoteCountLabel", { count: listing.quoteCount })}
										</span>
									)}
								</div>

								<p className="line-clamp-2 min-h-[42px] text-sm font-medium leading-snug text-ink">
									{listing.title}
								</p>

								<p className="mt-1.5 flex items-center gap-1.5 text-xs text-subtle">
									<CalendarDays size={12} className="shrink-0" />
									{t("registeredAndDeadline", {
										registered: new Date(listing.createdAt).toLocaleDateString(locale, {
											month: "numeric",
											day: "numeric",
										}),
										deadline: new Date(listing.endDate).toLocaleDateString(locale, {
											month: "numeric",
											day: "numeric",
										}),
									})}
								</p>

								{hasQuotes ? (
									<div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F3F4F6] pt-3">
										<div className="min-w-0">
											<p className="flex items-center gap-1 text-xs text-subtle">
												<TrendingDown size={11} className="text-[#D97706]" />
												{t("lowestPriceLabel")}
											</p>
											<p className="mt-0.5 truncate text-sm font-medium text-ink">
												{symbol} {listing.lowestPrice?.toLocaleString()}
											</p>
											{listing.totalBudget !== null && (
												<p className="truncate text-xs text-subtle">
													{t("budgetLabel", { amount: `${symbol} ${listing.totalBudget.toLocaleString()}` })}
												</p>
											)}
										</div>
										<div className="min-w-0">
											<p className="flex items-center gap-1 text-xs text-subtle">
												<Truck size={11} className="text-[#16A34A]" />
												{t("fastestDeliveryLabel")}
											</p>
											<p className="mt-0.5 text-sm font-medium text-ink">
												{t("days", { count: listing.fastestDays ?? 0 })}
											</p>
										</div>
									</div>
								) : (
									<div className="mt-3 border-t border-[#F3F4F6] pt-3">
										<p className="text-xs text-subtle">
											{t("noQuotesYet")}
											{!remaining.isClosed && ` · ${t("deadlineDays", { days: remaining.days })}`}
										</p>
									</div>
								)}
							</button>
						);
					})}
							</motion.div>
						)}
					</AnimatePresence>
				</LayoutGroup>
			)}

			{filteredListings.length > 0 && (
				<Pagination
					page={page}
					pageCount={pageCount}
					pageSize={pageSize}
					onPageChange={setPage}
					onPageSizeChange={setPageSize}
				/>
			)}
		</div>
	);
}
