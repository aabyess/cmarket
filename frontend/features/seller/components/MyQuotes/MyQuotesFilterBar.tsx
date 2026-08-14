"use client";

import { useTranslations } from "next-intl";
import { cva } from "class-variance-authority";
import { LayoutGrid, List } from "lucide-react";
import type { QuoteStatus } from "@/features/seller/types";

export type MyQuotesFilter = "all" | QuoteStatus;
export type MyQuotesViewMode = "grid" | "list";

const FILTER_VALUES: MyQuotesFilter[] = ["all", "pending", "awarded", "rejected"];

type MyQuotesFilterBarProps = {
	filter: MyQuotesFilter;
	counts: Record<MyQuotesFilter, number>;
	viewMode: MyQuotesViewMode;
	onFilterChange: (value: MyQuotesFilter) => void;
	onViewModeChange: (mode: MyQuotesViewMode) => void;
};

const filterButton = cva(
	"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200",
	{
		variants: {
			active: {
				true: "bg-imsg-blue text-white",
				false: "text-[#374151] hover:bg-[#F9FAFB]",
			},
		},
		defaultVariants: { active: false },
	},
);

const countText = cva("text-xs", {
	variants: {
		active: { true: "text-white/70", false: "text-[#9CA3AF]" },
	},
	defaultVariants: { active: false },
});

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
	counts,
	viewMode,
	onFilterChange,
	onViewModeChange,
}: MyQuotesFilterBarProps): React.JSX.Element {
	const t = useTranslations("MyQuotesFilterBar");
	const filterLabels: Record<MyQuotesFilter, string> = {
		all: t("filterAll"),
		pending: t("filterPending"),
		awarded: t("filterAwarded"),
		rejected: t("filterRejected"),
	};

	return (
		<div className="mb-4 flex items-center justify-between gap-2">
			<div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				{FILTER_VALUES.map((value) => (
					<button
						key={value}
						type="button"
						onClick={() => onFilterChange(value)}
						className={filterButton({ active: filter === value })}>
						{filterLabels[value]}
						<span className={countText({ active: filter === value })}>{counts[value]}</span>
					</button>
				))}
			</div>

			<div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
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
