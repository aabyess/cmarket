"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Clock, TrendingDown, Truck, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import {
	QuoteReviewFilterBar,
	type QuoteHasFilter,
	type QuoteSortOption,
} from "@/features/buyer/components/QuoteReview/QuoteReviewFilterBar";
import type { Currency, ListingWithQuotes } from "@/features/buyer/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemaining(endDate: string): { text: string; isUrgent: boolean; isClosed: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { text: "마감", isUrgent: false, isClosed: true };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { text: `D-${days}`, isUrgent: days <= 3, isClosed: false };
}

type QuoteReviewListingPickerProps = {
	listings: ListingWithQuotes[];
};

export function QuoteReviewListingPicker({ listings }: QuoteReviewListingPickerProps): React.ReactNode {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [sort, setSort] = useState<QuoteSortOption>("deadline");
	const [hasFilter, setHasFilter] = useState<QuoteHasFilter>("all");

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

	if (listings.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Mail size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-base font-medium text-[#1F2937]">등록한 공고가 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">
					공고를 올리면 공급기업들이 견적을 보내드려요.
				</p>
				<button
					onClick={() => router.push("/buyer/post-listing")}
					className="mt-5 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
				>
					첫 공고 올리기
				</button>
			</div>
		);
	}

	return (
		<div>
			<QuoteReviewFilterBar
				search={search}
				onSearchChange={setSearch}
				sort={sort}
				onSortChange={setSort}
				hasFilter={hasFilter}
				onHasFilterChange={setHasFilter}
			/>

			{filteredListings.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<p className="text-sm font-medium text-[#1F2937]">조건에 맞는 공고가 없어요</p>
					<p className="mt-1 text-sm text-[#6B7280]">검색어나 필터를 조정해보세요.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{filteredListings.map((listing) => {
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
										? "border-[#E5E7EB] hover:border-[#BFDBFE] hover:shadow-sm"
										: "border-[#F3F4F6] opacity-60 hover:opacity-100",
								)}
							>
								<div className="mb-2 flex items-start justify-between gap-2">
									{isAwarded ? (
										<span className="flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-xs font-medium text-[#059669]">
											<CheckCircle2 size={11} />
											거래 확정
										</span>
									) : (
										<span
											className={cn(
												"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
												remaining.isClosed
													? "bg-[#F3F4F6] text-[#6B7280]"
													: remaining.isUrgent
														? "bg-[#FEF2F2] text-[#DC2626]"
														: "bg-[#EFF6FF] text-[#3B82F6]",
											)}
										>
											<Clock size={11} />
											{remaining.text}
										</span>
									)}

									{hasQuotes && (
										<span className="shrink-0 text-xs font-semibold text-[#3B82F6]">
											견적 {listing.quoteCount}
										</span>
									)}
								</div>

								<p className="line-clamp-2 min-h-[42px] text-sm font-medium leading-snug text-[#1F2937]">
									{listing.title}
								</p>

								{hasQuotes ? (
									<div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F3F4F6] pt-3">
										<div>
											<p className="flex items-center gap-1 text-xs text-[#9CA3AF]">
												<TrendingDown size={11} className="text-[#D97706]" />
												최저가
											</p>
											<p className="mt-0.5 truncate text-sm font-medium text-[#1F2937]">
												{symbol} {listing.lowestPrice?.toLocaleString()}
											</p>
										</div>
										<div>
											<p className="flex items-center gap-1 text-xs text-[#9CA3AF]">
												<Truck size={11} className="text-[#16A34A]" />
												최속납기
											</p>
											<p className="mt-0.5 text-sm font-medium text-[#1F2937]">
												{listing.fastestDays}일
											</p>
										</div>
									</div>
								) : (
									<div className="mt-3 border-t border-[#F3F4F6] pt-3">
										<p className="text-xs text-[#9CA3AF]">아직 견적이 없어요</p>
									</div>
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}