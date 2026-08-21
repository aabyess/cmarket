"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Search, FileSearch, ArrowUpDown, Star } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePersistentState } from "@/hooks/usePersistentState";
import { ListingBrowseCard } from "@/features/seller/components/ListingBrowse/ListingBrowseCard";
import { ListingBrowseTable } from "@/features/seller/components/ListingBrowse/ListingBrowseTable";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import { Pagination } from "@/components/commons/Pagination";
import type { OpenListing } from "@/features/seller/types";

type StatusTab = "all" | "active" | "closed";
type SortOption = "deadline" | "newest";
type QuoteFilter = "all" | "quoted" | "notQuoted";

const TAB_VALUES: StatusTab[] = ["all", "active", "closed"];
const SORT_VALUES: SortOption[] = ["deadline", "newest"];
const QUOTE_FILTER_VALUES: QuoteFilter[] = ["all", "quoted", "notQuoted"];

type ListingBrowsePrefs = {
	statusTab: StatusTab;
	sort: SortOption;
	quoteFilter: QuoteFilter;
	bookmarkedOnly: boolean;
	viewMode: ViewMode;
	pageSize: number;
};

const DEFAULT_PREFS: ListingBrowsePrefs = {
	statusTab: "all",
	sort: "deadline",
	quoteFilter: "all",
	bookmarkedOnly: false,
	viewMode: "grid",
	pageSize: 9,
};

function isListingClosed(listing: OpenListing): boolean {
	return listing.status !== "active" || new Date(listing.endDate).getTime() <= Date.now();
}

type ListingBrowseProps = {
	listings: OpenListing[];
};

export function ListingBrowse({ listings }: ListingBrowseProps): React.ReactNode {
	const t = useTranslations("ListingBrowse");
	const router = useRouter();
	const [keyword, setKeyword] = useState("");
	const [prefs, setPrefs] = usePersistentState<ListingBrowsePrefs>(
		"mitrapay:seller-browse",
		DEFAULT_PREFS,
	);
	const { statusTab, sort, quoteFilter, bookmarkedOnly, viewMode, pageSize } = prefs;
	const [page, setPage] = useState(1);
	// 목록 필터링(관심 공고만 보기)에 즉시 반영되어야 해서 각 카드/행의 낙관적 토글 결과를
	// 여기서도 별도로 추적한다. 초기값은 서버에서 내려준 listings의 isBookmarked를 따른다.
	const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(
		() => new Set(listings.filter((listing) => listing.isBookmarked).map((listing) => listing.id)),
	);

	function handleBookmarkChange(listingId: string, isBookmarked: boolean): void {
		setBookmarkedIds((prev) => {
			const next = new Set(prev);
			if (isBookmarked) next.add(listingId);
			else next.delete(listingId);
			return next;
		});
	}

	function setStatusTab(statusTab: StatusTab): void {
		setPrefs((prev) => ({ ...prev, statusTab }));
	}

	function setSort(sort: SortOption): void {
		setPrefs((prev) => ({ ...prev, sort }));
	}

	function setQuoteFilter(quoteFilter: QuoteFilter): void {
		setPrefs((prev) => ({ ...prev, quoteFilter }));
	}

	function setViewMode(viewMode: ViewMode): void {
		setPrefs((prev) => ({ ...prev, viewMode }));
	}

	function setPageSize(pageSize: number): void {
		setPrefs((prev) => ({ ...prev, pageSize }));
	}

	const tabLabels: Record<StatusTab, string> = {
		all: t("tabAll"),
		active: t("tabActive"),
		closed: t("tabClosed"),
	};

	const sortLabels: Record<SortOption, string> = {
		deadline: t("sortDeadline"),
		newest: t("sortNewest"),
	};

	const quoteFilterLabels: Record<QuoteFilter, string> = {
		all: t("quoteFilterAll"),
		quoted: t("quoteFilterQuoted"),
		notQuoted: t("quoteFilterNotQuoted"),
	};

	const sortTriggerLabelParts = [sortLabels[sort]];
	if (statusTab !== "all") sortTriggerLabelParts.push(tabLabels[statusTab]);
	if (quoteFilter !== "all") sortTriggerLabelParts.push(quoteFilterLabels[quoteFilter]);
	const sortTriggerLabel = sortTriggerLabelParts.join(" · ");

	const trimmedKeyword = keyword.trim().toLowerCase();

	const filteredListings = useMemo(() => {
		const filtered = listings.filter((listing) => {
			const isClosed = isListingClosed(listing);
			if (statusTab === "active" && isClosed) return false;
			if (statusTab === "closed" && !isClosed) return false;
			if (quoteFilter === "quoted" && !listing.hasMyQuote) return false;
			if (quoteFilter === "notQuoted" && listing.hasMyQuote) return false;
			if (bookmarkedOnly && !bookmarkedIds.has(listing.id)) return false;
			if (!trimmedKeyword) return true;

			const haystack = [
				listing.title,
				listing.description,
				...listing.items.map((item) => item.name),
				...listing.items.map((item) => item.spec),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(trimmedKeyword);
		});

		return [...filtered].sort((a, b) => {
			if (sort === "newest") {
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}

			const aClosed = isListingClosed(a);
			const bClosed = isListingClosed(b);
			if (aClosed !== bClosed) return aClosed ? 1 : -1;
			return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
		});
	}, [listings, statusTab, trimmedKeyword, sort, quoteFilter, bookmarkedOnly, bookmarkedIds]);

	useEffect(() => {
		setPage(1);
	}, [statusTab, trimmedKeyword, sort, quoteFilter, bookmarkedOnly, pageSize, listings.length]);

	const pageCount = Math.max(1, Math.ceil(filteredListings.length / pageSize));
	const paginatedListings = filteredListings.slice((page - 1) * pageSize, page * pageSize);

	return (
		<div>
			<div className="relative mb-3">
				<Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]" />
				<input
					type="text"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder={t("searchPlaceholder")}
					className="focus:border-imsg-blue focus:ring-imsg-blue w-full rounded-xl border border-[#E2E8F0] bg-white py-3.5 pr-4 pl-11 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:ring-1 focus:outline-none"
				/>
			</div>

			<div className="mb-4 flex items-center justify-end gap-2">
				<div className="flex items-center gap-2">
					<button
						onClick={() => setPrefs((prev) => ({ ...prev, bookmarkedOnly: !prev.bookmarkedOnly }))}
						className={cn(
							"flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
							bookmarkedOnly
								? "border-amber-300 bg-amber-50 text-amber-600"
								: "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]",
						)}>
						<Star size={14} fill={bookmarkedOnly ? "currentColor" : "none"} />
						{t("bookmarkedOnlyFilter")}
					</button>

					<Popover className="relative">
						<PopoverButton className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
							<ArrowUpDown size={14} />
							{sortTriggerLabel}
						</PopoverButton>

						<PopoverPanel className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
							<p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-[#9CA3AF]">
								{t("sortSectionLabel")}
							</p>
							{SORT_VALUES.map((option) => (
								<button
									key={option}
									onClick={() => setSort(option)}
									className={cn(
										"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
										sort === option
											? "text-imsg-blue bg-[#EFF6FF]"
											: "text-[#374151] hover:bg-[#F9FAFB]",
									)}>
									{sortLabels[option]}
								</button>
							))}

							<div className="my-1.5 border-t border-[#E5E7EB]" />

							<p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-[#9CA3AF]">
								{t("statusSectionLabel")}
							</p>
							{TAB_VALUES.map((option) => (
								<button
									key={option}
									onClick={() => setStatusTab(option)}
									className={cn(
										"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
										statusTab === option
											? "text-imsg-blue bg-[#EFF6FF]"
											: "text-[#374151] hover:bg-[#F9FAFB]",
									)}>
									{tabLabels[option]}
								</button>
							))}

							<div className="my-1.5 border-t border-[#E5E7EB]" />

							<p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-[#9CA3AF]">
								{t("quoteFilterSectionLabel")}
							</p>
							{QUOTE_FILTER_VALUES.map((option) => (
								<button
									key={option}
									onClick={() => setQuoteFilter(option)}
									className={cn(
										"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
										quoteFilter === option
											? "text-imsg-blue bg-[#EFF6FF]"
											: "text-[#374151] hover:bg-[#F9FAFB]",
									)}>
									{quoteFilterLabels[option]}
								</button>
							))}
						</PopoverPanel>
					</Popover>

					<ViewModeToggle value={viewMode} onChange={setViewMode} />
				</div>
			</div>

			{filteredListings.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
						<FileSearch size={26} className="text-[#9CA3AF]" />
					</div>
					<p className="text-base font-medium text-[#1F2937]">
						{trimmedKeyword
							? t("emptySearchTitle")
							: bookmarkedOnly
								? t("emptyBookmarkTitle")
								: t("emptyDefaultTitle")}
					</p>
					<p className="mt-1 text-sm text-[#6B7280]">
						{trimmedKeyword
							? t("emptySearchDescription")
							: bookmarkedOnly
								? t("emptyBookmarkDescription")
								: t("emptyDefaultDescription")}
					</p>
				</div>
			) : viewMode === "list" ? (
				<ListingBrowseTable
					listings={paginatedListings}
					onRowClick={(id) => router.push(`/seller/listing-browse/${id}`)}
					onBookmarkChange={handleBookmarkChange}
				/>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{paginatedListings.map((listing) => (
						<ListingBrowseCard
							key={listing.id}
							listing={listing}
							onClick={() => router.push(`/seller/listing-browse/${listing.id}`)}
							onBookmarkChange={handleBookmarkChange}
						/>
					))}
				</div>
			)}

			{filteredListings.length > 0 && (
				<Pagination
					page={page}
					pageCount={pageCount}
					pageSize={pageSize}
					onPageChange={setPage}
					onPageSizeChange={setPageSize}
					pageSizeOptions={[9, 18, 30, 60]}
				/>
			)}
		</div>
	);
}
