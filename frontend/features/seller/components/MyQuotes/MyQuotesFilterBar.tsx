"use client";

import { useTranslations } from "next-intl";
import { cva } from "class-variance-authority";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ArrowUpDown, LayoutGrid, List } from "lucide-react";
import { cn } from "@/utils/cn";
import type { QuoteStatus } from "@/features/seller/types";

export type MyQuotesFilter = "all" | QuoteStatus;
export type MyQuotesViewMode = "grid" | "list";
export type MyQuotesSort = "newest" | "oldest" | "deadline";

const FILTER_VALUES: MyQuotesFilter[] = ["all", "pending", "awarded", "rejected"];
const SORT_VALUES: MyQuotesSort[] = ["newest", "oldest", "deadline"];

type MyQuotesFilterBarProps = {
	filter: MyQuotesFilter;
	sort: MyQuotesSort;
	viewMode: MyQuotesViewMode;
	onFilterChange: (value: MyQuotesFilter) => void;
	onSortChange: (value: MyQuotesSort) => void;
	onViewModeChange: (mode: MyQuotesViewMode) => void;
};

const viewButton = cva(
	"flex size-8 items-center justify-center rounded-lg transition-colors duration-200",
	{
		variants: {
			active: {
				true: "bg-imsg-blue text-white",
				false: "text-[#9CA3AF] hover:bg-[#F9FAFB]",
			},
		},
		defaultVariants: { active: false },
	},
);

export function MyQuotesFilterBar({
	filter,
	sort,
	viewMode,
	onFilterChange,
	onSortChange,
	onViewModeChange,
}: MyQuotesFilterBarProps): React.JSX.Element {
	const t = useTranslations("MyQuotesFilterBar");
	const filterLabels: Record<MyQuotesFilter, string> = {
		all: t("filterAll"),
		pending: t("filterPending"),
		awarded: t("filterAwarded"),
		rejected: t("filterRejected"),
	};
	const sortLabels: Record<MyQuotesSort, string> = {
		newest: t("sortNewest"),
		oldest: t("sortOldest"),
		deadline: t("sortDeadline"),
	};

	const sortTriggerLabel =
		filter === "all" ? sortLabels[sort] : `${sortLabels[sort]} · ${filterLabels[filter]}`;

	return (
		<div className="mb-4 flex items-center justify-end gap-2">
			<Popover className="relative">
				<PopoverButton className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
					<ArrowUpDown size={14} />
					{sortTriggerLabel}
				</PopoverButton>

				<PopoverPanel className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
					<p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold text-[#9CA3AF]">
						{t("sortSectionLabel")}
					</p>
					{SORT_VALUES.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => onSortChange(option)}
							className={cn(
								"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
								sort === option
									? "bg-[#EFF6FF] text-imsg-blue"
									: "text-[#374151] hover:bg-[#F9FAFB]",
							)}>
							{sortLabels[option]}
						</button>
					))}

					<div className="my-1.5 border-t border-[#E5E7EB]" />

					<p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold text-[#9CA3AF]">
						{t("statusSectionLabel")}
					</p>
					{FILTER_VALUES.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => onFilterChange(option)}
							className={cn(
								"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
								filter === option
									? "bg-[#EFF6FF] text-imsg-blue"
									: "text-[#374151] hover:bg-[#F9FAFB]",
							)}>
							{filterLabels[option]}
						</button>
					))}
				</PopoverPanel>
			</Popover>

			<div className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				<button
					type="button"
					onClick={() => onViewModeChange("grid")}
					aria-label={t("gridViewAriaLabel")}
					className={viewButton({ active: viewMode === "grid" })}>
					<LayoutGrid size={15} />
				</button>
				<button
					type="button"
					onClick={() => onViewModeChange("list")}
					aria-label={t("listViewAriaLabel")}
					className={viewButton({ active: viewMode === "list" })}>
					<List size={15} />
				</button>
			</div>
		</div>
	);
}
