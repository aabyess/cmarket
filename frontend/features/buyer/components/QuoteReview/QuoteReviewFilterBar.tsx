"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ArrowUpDown, Search } from "lucide-react";
import { cn } from "@/utils/cn";

export type QuoteSortOption = "deadline" | "newest" | "quoteCount" | "lowestPrice";
export type QuoteHasFilter = "all" | "has" | "none";

const SORT_LABEL: Record<QuoteSortOption, string> = {
	deadline: "마감순",
	newest: "최신등록순",
	quoteCount: "견적 많은순",
	lowestPrice: "최저가순",
};

const HAS_FILTER_OPTIONS: { value: QuoteHasFilter; label: string }[] = [
	{ value: "all", label: "전체" },
	{ value: "has", label: "견적 있음" },
	{ value: "none", label: "견적 없음" },
];

type QuoteReviewFilterBarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	sort: QuoteSortOption;
	onSortChange: (value: QuoteSortOption) => void;
	hasFilter: QuoteHasFilter;
	onHasFilterChange: (value: QuoteHasFilter) => void;
};

export function QuoteReviewFilterBar({
	search,
	onSearchChange,
	sort,
	onSortChange,
	hasFilter,
	onHasFilterChange,
}: QuoteReviewFilterBarProps): React.ReactNode {
	return (
		<div className="mb-4 flex w-fit items-center rounded-xl border border-[#E5E7EB] bg-white">
			<div className="flex items-center gap-2 px-3.5 py-2.5">
				<Search size={16} className="text-[#9CA3AF]" />
				<input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="공고 검색"
					className="w-40 bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
				/>
			</div>

			<div className="h-6 w-px bg-[#E5E7EB]" />

			<div className="flex items-center gap-1 px-2 py-1.5">
				{HAS_FILTER_OPTIONS.map((option) => (
					<button
						key={option.value}
						onClick={() => onHasFilterChange(option.value)}
						className={cn(
							"rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
							hasFilter === option.value
								? "bg-[#3B82F6] text-white"
								: "text-[#374151] hover:bg-[#F9FAFB]",
						)}
					>
						{option.label}
					</button>
				))}
			</div>

			<div className="h-6 w-px bg-[#E5E7EB]" />

			<Popover className="relative">
				<PopoverButton className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
					<ArrowUpDown size={14} />
					{SORT_LABEL[sort]}
				</PopoverButton>

				<PopoverPanel className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
					{(Object.keys(SORT_LABEL) as QuoteSortOption[]).map((option) => (
						<button
							key={option}
							onClick={() => onSortChange(option)}
							className={cn(
								"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
								sort === option
									? "bg-[#EFF6FF] text-[#3B82F6]"
									: "text-[#374151] hover:bg-[#F9FAFB]",
							)}
						>
							{SORT_LABEL[option]}
						</button>
					))}
				</PopoverPanel>
			</Popover>
		</div>
	);
}