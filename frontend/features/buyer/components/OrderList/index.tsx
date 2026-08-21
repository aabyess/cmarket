"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FileText } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { OrderListCard } from "@/features/buyer/components/OrderList/OrderListCard";
import { OrderListTable } from "@/features/buyer/components/OrderList/OrderListTable";
import {
	OrderListFilterBar,
	type SortOption,
	type ViewMode,
} from "@/features/buyer/components/OrderList/OrderListFilterBar";
import type { ListingStatus, ListingSummary } from "@/features/buyer/types";
import { Pagination } from "@/components/commons/Pagination";

type OrderListPrefs = {
	sort: SortOption;
	statusFilter: ListingStatus | null;
	viewMode: ViewMode;
	pageSize: number;
};

const DEFAULT_PREFS: OrderListPrefs = {
	sort: "newest",
	statusFilter: null,
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
	const [prefs, setPrefs] = usePersistentState<OrderListPrefs>("mitrapay:buyer-order-list", DEFAULT_PREFS);
	const { sort, statusFilter, viewMode, pageSize } = prefs;
	const [page, setPage] = useState(1);

	function setSort(sort: SortOption): void {
		setPrefs((prev) => ({ ...prev, sort }));
	}

	function selectStatus(status: ListingStatus): void {
		setPrefs((prev) => ({ ...prev, statusFilter: prev.statusFilter === status ? null : status }));
	}

	function clearStatus(): void {
		setPrefs((prev) => ({ ...prev, statusFilter: null }));
	}

	function setViewMode(viewMode: ViewMode): void {
		setPrefs((prev) => ({ ...prev, viewMode }));
	}

	function setPageSize(pageSize: number): void {
		setPrefs((prev) => ({ ...prev, pageSize }));
	}

	const statusCounts = useMemo(() => {
		const counts: Record<ListingStatus, number> = { active: 0, closed: 0, awarded: 0 };
		for (const listing of listings) {
			counts[listing.status] += 1;
		}
		return counts;
	}, [listings]);

	const filteredListings = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		const filtered = listings.filter((listing) => {
			if (statusFilter !== null && listing.status !== statusFilter) return false;
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
	}, [listings, search, sort, statusFilter]);

	useEffect(() => {
		setPage(1);
	}, [search, sort, statusFilter, pageSize]);

	const pageCount = Math.max(1, Math.ceil(filteredListings.length / pageSize));
	const paginatedListings = filteredListings.slice((page - 1) * pageSize, page * pageSize);

	function handleSelect(id: string): void {
		router.push(`/buyer/listing/${id}`);
	}

	if (listings.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<FileText size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-base font-medium text-[#1F2937]">{t("emptyTitle")}</p>
				<p className="mt-1 text-sm text-[#6B7280]">
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
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			{filteredListings.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<p className="text-sm font-medium text-[#1F2937]">{t("noResultsTitle")}</p>
					<p className="mt-1 text-sm text-[#6B7280]">{t("noResultsDescription")}</p>
				</div>
			) : (
				<>
					{viewMode === "grid" ? (
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							{paginatedListings.map((listing) => (
								<OrderListCard key={listing.id} listing={listing} onClick={() => handleSelect(listing.id)} />
							))}
						</div>
					) : (
						<OrderListTable listings={paginatedListings} onSelect={handleSelect} />
					)}

					<Pagination
						page={page}
						pageCount={pageCount}
						pageSize={pageSize}
						onPageChange={setPage}
						onPageSizeChange={setPageSize}
					/>
				</>
			)}
		</div>
	);
}