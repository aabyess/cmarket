"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { FileText } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useFilterPresets } from "@/hooks/useFilterPresets";
import { OrderListCard } from "@/features/buyer/components/OrderList/OrderListCard";
import { OrderListTable } from "@/features/buyer/components/OrderList/OrderListTable";
import { OrderListBookmarkersModal } from "@/features/buyer/components/OrderListBookmarkersModal";
import {
	OrderListFilterBar,
	type OrderListFilterPresetValue,
	type SortOption,
	type ViewMode,
} from "@/features/buyer/components/OrderList/OrderListFilterBar";
import {
	getDisplayListingStatus,
	type DisplayListingStatus,
} from "@/utils/getDisplayListingStatus";
import type { ListingSummary } from "@/features/buyer/types";
import { Pagination } from "@/components/commons/Pagination";

type OrderListPrefs = {
	sort: SortOption;
	statusFilter: DisplayListingStatus | null;
	bookmarkedOnly: boolean;
	viewMode: ViewMode;
	pageSize: number;
};

const DEFAULT_PREFS: OrderListPrefs = {
	sort: "newest",
	statusFilter: null,
	bookmarkedOnly: false,
	viewMode: "list",
	pageSize: 10,
};

type OrderListProps = {
	listings: ListingSummary[];
};

export function OrderList({ listings }: OrderListProps): React.ReactNode {
	const t = useTranslations("OrderList");
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [prefs, setPrefs] = usePersistentState<OrderListPrefs>(
		"mitrapay:buyer-order-list",
		DEFAULT_PREFS,
	);
	const { sort, statusFilter, bookmarkedOnly, viewMode, pageSize } = prefs;
	const [page, setPage] = useState(1);
	const [bookmarksListingId, setBookmarksListingId] = useState<string | null>(null);
	const {
		presets: filterPresets,
		savePreset,
		deletePreset,
	} = useFilterPresets<OrderListFilterPresetValue>("mitrapay:buyer-order-list-presets");

	function applyFilterPreset(value: OrderListFilterPresetValue): void {
		setSearch(value.search);
		setPrefs((prev) => ({
			...prev,
			sort: value.sort,
			statusFilter: value.statusFilter,
			bookmarkedOnly: value.bookmarkedOnly,
		}));
	}

	function saveFilterPreset(name: string): void {
		savePreset(name, { search, sort, statusFilter, bookmarkedOnly });
	}

	function setSort(sort: SortOption): void {
		setPrefs((prev) => ({ ...prev, sort }));
	}

	function selectStatus(status: DisplayListingStatus): void {
		setPrefs((prev) => ({ ...prev, statusFilter: prev.statusFilter === status ? null : status }));
	}

	function clearStatus(): void {
		setPrefs((prev) => ({ ...prev, statusFilter: null }));
	}

	function toggleBookmarkedOnly(): void {
		setPrefs((prev) => ({ ...prev, bookmarkedOnly: !prev.bookmarkedOnly }));
	}

	function setViewMode(viewMode: ViewMode): void {
		setPrefs((prev) => ({ ...prev, viewMode }));
	}

	function setPageSize(pageSize: number): void {
		setPrefs((prev) => ({ ...prev, pageSize }));
	}

	const statusCounts = useMemo(() => {
		const counts: Record<DisplayListingStatus, number> = {
			active: 0,
			closed: 0,
			awarded: 0,
			failed: 0,
		};
		for (const listing of listings) {
			const displayStatus = getDisplayListingStatus(
				listing.status,
				listing.endDate,
				listing.status === "awarded",
			);
			counts[displayStatus] += 1;
		}
		return counts;
	}, [listings]);

	const filteredListings = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		const filtered = listings.filter((listing) => {
			if (statusFilter !== null) {
				const displayStatus = getDisplayListingStatus(
					listing.status,
					listing.endDate,
					listing.status === "awarded",
				);
				if (displayStatus !== statusFilter) return false;
			}
			if (bookmarkedOnly && listing.bookmarkCount === 0) return false;
			if (!keyword) return true;

			const itemNames = listing.items
				.map((item) => item.name)
				.join(" ")
				.toLowerCase();
			return listing.title.toLowerCase().includes(keyword) || itemNames.includes(keyword);
		});

		return [...filtered].sort((a, b) => {
			if (sort === "deadline") {
				return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
			}
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	}, [listings, search, sort, statusFilter, bookmarkedOnly]);

	useEffect(() => {
		setPage(1);
	}, [search, sort, statusFilter, bookmarkedOnly, pageSize]);

	const pageCount = Math.max(1, Math.ceil(filteredListings.length / pageSize));
	const paginatedListings = filteredListings.slice((page - 1) * pageSize, page * pageSize);

	function handleSelect(id: string): void {
		router.push(`/buyer/listing/${id}`);
	}

	if (listings.length === 0) {
		return (
			<div className="border-hairline rounded-2xl border bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<FileText size={26} className="text-subtle" />
				</div>
				<p className="text-ink text-base font-medium">{t("emptyTitle")}</p>
				<p className="text-muted mt-1 text-sm">{t("emptyDescription")}</p>
				<button
					onClick={() => router.push("/buyer/post-listing")}
					className="bg-imsg-blue mt-5 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]">
					{t("emptyAction")}
				</button>
			</div>
		);
	}

	return (
		<div>
			<OrderListFilterBar
				search={search}
				onSearchChange={setSearch}
				sort={sort}
				onSortChange={setSort}
				statusFilter={statusFilter}
				onSelectStatus={selectStatus}
				onClearStatus={clearStatus}
				statusCounts={statusCounts}
				totalCount={listings.length}
				bookmarkedOnly={bookmarkedOnly}
				onToggleBookmarkedOnly={toggleBookmarkedOnly}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				filterPresets={filterPresets}
				onApplyFilterPreset={applyFilterPreset}
				onSaveFilterPreset={saveFilterPreset}
				onDeleteFilterPreset={deletePreset}
			/>

			{filteredListings.length === 0 ? (
				<div className="border-hairline rounded-2xl border bg-white p-12 text-center">
					<p className="text-ink text-sm font-medium">{t("noResultsTitle")}</p>
					<p className="text-muted mt-1 text-sm">{t("noResultsDescription")}</p>
				</div>
			) : (
				<>
					{/* 그리드↔테이블 전환 시 상태 배지가 이전 위치에서 새 위치로 이동하는 느낌을
					    주기 위해 같은 layoutId를 공유한다(#161과 동일 패턴). */}
					<LayoutGroup id="order-list">
						<AnimatePresence mode="popLayout" initial={false}>
							{viewMode === "grid" ? (
								<motion.div
									key="grid"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15 }}
									className="grid grid-cols-1 gap-3 md:grid-cols-2">
									{paginatedListings.map((listing) => (
										<OrderListCard
											key={listing.id}
											listing={listing}
											onClick={() => handleSelect(listing.id)}
											onOpenBookmarks={() => setBookmarksListingId(listing.id)}
										/>
									))}
								</motion.div>
							) : (
								<motion.div
									key="table"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15 }}>
									<OrderListTable
										listings={paginatedListings}
										onSelect={handleSelect}
										onOpenBookmarks={setBookmarksListingId}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</LayoutGroup>

					<Pagination
						page={page}
						pageCount={pageCount}
						pageSize={pageSize}
						onPageChange={setPage}
						onPageSizeChange={setPageSize}
					/>
				</>
			)}

			<OrderListBookmarkersModal
				listingId={bookmarksListingId}
				onClose={() => setBookmarksListingId(null)}
			/>
		</div>
	);
}
