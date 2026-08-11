"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { OrderListCard } from "@/features/buyer/components/OrderList/OrderListCard";
import { OrderListTable } from "@/features/buyer/components/OrderList/OrderListTable";
import {
	OrderListFilterBar,
	type SortOption,
	type ViewMode,
} from "@/features/buyer/components/OrderList/OrderListFilterBar";
import type { ListingStatus, ListingSummary } from "@/features/buyer/types";

type OrderListProps = {
	listings: ListingSummary[];
};

export function OrderList({ listings }: OrderListProps): React.ReactNode {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<SortOption>("newest");
	const [statusFilter, setStatusFilter] = useState<Set<ListingStatus>>(new Set());
	const [viewMode, setViewMode] = useState<ViewMode>("list");

	function toggleStatus(status: ListingStatus): void {
		setStatusFilter((prev) => {
			const next = new Set(prev);
			if (next.has(status)) {
				next.delete(status);
			} else {
				next.add(status);
			}
			return next;
		});
	}

	const filteredListings = useMemo(() => {
		const keyword = search.trim().toLowerCase();

		const filtered = listings.filter((listing) => {
			if (statusFilter.size > 0 && !statusFilter.has(listing.status)) return false;
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

	function handleSelect(id: string): void {
		router.push(`/buyer/listing/${id}`);
	}

	if (listings.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<FileText size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-[17px] font-medium text-[#1F2937]">등록한 견적요청이 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">
					첫 견적요청을 올리면 한국 공급기업들이 견적을 보내드려요.
				</p>
				<button
					onClick={() => router.push("/buyer/post-listing")}
					className="mt-5 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
				>
					첫 견적요청 올리기
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
				onToggleStatus={toggleStatus}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
			/>

			{filteredListings.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<p className="text-[15px] font-medium text-[#1F2937]">조건에 맞는 견적요청이 없어요</p>
					<p className="mt-1 text-sm text-[#6B7280]">검색어나 필터를 조정해보세요.</p>
				</div>
			) : viewMode === "grid" ? (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{filteredListings.map((listing) => (
						<OrderListCard key={listing.id} listing={listing} onClick={() => handleSelect(listing.id)} />
					))}
				</div>
			) : (
				<OrderListTable listings={filteredListings} onSelect={handleSelect} />
			)}
		</div>
	);
}