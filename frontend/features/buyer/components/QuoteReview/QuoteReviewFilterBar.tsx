"use client";

import { useTranslations } from "next-intl";
import { Popover, PopoverButton } from "@headlessui/react";
import { ArrowUpDown, Search } from "lucide-react";
import { AnimatedPopoverPanel } from "@/components/commons/AnimatedPopoverPanel";
import { FilterPresetsDropdown } from "@/features/shared/components/FilterPresetsDropdown";
import { cn } from "@/utils/cn";
import type { FilterPreset } from "@/hooks/useFilterPresets";

export type QuoteSortOption = "deadline" | "newest" | "quoteCount" | "lowestPrice";
export type QuoteHasFilter = "all" | "has" | "none";

const SORT_VALUES: QuoteSortOption[] = ["deadline", "newest", "quoteCount", "lowestPrice"];

const HAS_FILTER_VALUES: QuoteHasFilter[] = ["all", "has", "none"];

export type QuoteReviewFilterPresetValue = {
	search: string;
	sort: QuoteSortOption;
	hasFilter: QuoteHasFilter;
};

type QuoteReviewFilterBarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	sort: QuoteSortOption;
	onSortChange: (value: QuoteSortOption) => void;
	hasFilter: QuoteHasFilter;
	onHasFilterChange: (value: QuoteHasFilter) => void;
	hasFilterCounts: Record<QuoteHasFilter, number>;
	filterPresets: FilterPreset<QuoteReviewFilterPresetValue>[];
	onApplyFilterPreset: (value: QuoteReviewFilterPresetValue) => void;
	onSaveFilterPreset: (name: string) => void;
	onDeleteFilterPreset: (id: string) => void;
};

export function QuoteReviewFilterBar({
	search,
	onSearchChange,
	sort,
	onSortChange,
	hasFilter,
	onHasFilterChange,
	hasFilterCounts,
	filterPresets,
	onApplyFilterPreset,
	onSaveFilterPreset,
	onDeleteFilterPreset,
}: QuoteReviewFilterBarProps): React.ReactNode {
	const t = useTranslations("QuoteReviewFilterBar");

	const sortLabels: Record<QuoteSortOption, string> = {
		deadline: t("sortDeadline"),
		newest: t("sortNewest"),
		quoteCount: t("sortQuoteCount"),
		lowestPrice: t("sortLowestPrice"),
	};

	const hasFilterLabels: Record<QuoteHasFilter, string> = {
		all: t("filterAll"),
		has: t("filterHas"),
		none: t("filterNone"),
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			<div className="border-hairline flex flex-wrap items-center gap-1 rounded-xl border bg-white p-1">
				{HAS_FILTER_VALUES.map((value) => {
					const isActive = hasFilter === value;
					return (
						<button
							key={value}
							onClick={() => onHasFilterChange(value)}
							className={cn(
								"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
								isActive ? "bg-imsg-blue text-white" : "text-[#374151] hover:bg-[#F9FAFB]",
							)}>
							{hasFilterLabels[value]}
							<span className={cn("text-xs", isActive ? "text-white/70" : "text-subtle")}>
								{hasFilterCounts[value]}
							</span>
						</button>
					);
				})}

				<div className="bg-hairline mx-1 h-6 w-px" />

				<div className="flex items-center gap-2 px-2 py-1">
					<Search size={16} className="text-subtle shrink-0" />
					<input
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder={t("searchPlaceholder")}
						className="placeholder:text-subtle w-32 bg-transparent text-sm leading-none outline-none"
					/>
				</div>

				<div className="bg-hairline mx-1 h-6 w-px" />

				<Popover className="relative">
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
								<ArrowUpDown size={14} />
								{sortLabels[sort]}
							</PopoverButton>

							<AnimatedPopoverPanel
								open={open}
								className="border-hairline absolute right-0 z-20 mt-2 w-44 rounded-2xl border bg-white p-1.5 shadow-lg">
								{SORT_VALUES.map((option) => (
									<button
										key={option}
										onClick={() => onSortChange(option)}
										className={cn(
											"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
											sort === option
												? "text-imsg-blue bg-[#EFF6FF]"
												: "text-[#374151] hover:bg-[#F9FAFB]",
										)}>
										{sortLabels[option]}
									</button>
								))}
							</AnimatedPopoverPanel>
						</>
					)}
				</Popover>
			</div>

			<FilterPresetsDropdown<QuoteReviewFilterPresetValue>
				presets={filterPresets}
				currentValue={{ search, sort, hasFilter }}
				onApply={onApplyFilterPreset}
				onSave={onSaveFilterPreset}
				onDelete={onDeleteFilterPreset}
			/>
		</div>
	);
}
