"use client";

import { useTranslations } from "next-intl";
import { Popover, PopoverButton } from "@headlessui/react";
import { ArrowUpDown, Search, Star } from "lucide-react";
import { AnimatedPopoverPanel } from "@/components/commons/AnimatedPopoverPanel";
import { FilterPresetsDropdown } from "@/features/shared/components/FilterPresetsDropdown";
import { cn } from "@/utils/cn";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import type { FilterPreset } from "@/hooks/useFilterPresets";
import type { DisplayListingStatus } from "@/utils/getDisplayListingStatus";

export type SortOption = "newest" | "deadline";
export type { ViewMode };

export type OrderListFilterPresetValue = {
	search: string;
	sort: SortOption;
	statusFilter: DisplayListingStatus | null;
	bookmarkedOnly: boolean;
};

const STATUS_VALUES: DisplayListingStatus[] = ["active", "closed", "awarded", "failed"];

const SORT_VALUES: SortOption[] = ["newest", "deadline"];

type OrderListFilterBarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	sort: SortOption;
	onSortChange: (value: SortOption) => void;
	statusFilter: DisplayListingStatus | null;
	onSelectStatus: (status: DisplayListingStatus) => void;
	onClearStatus: () => void;
	statusCounts: Record<DisplayListingStatus, number>;
	totalCount: number;
	bookmarkedOnly: boolean;
	onToggleBookmarkedOnly: () => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
	filterPresets: FilterPreset<OrderListFilterPresetValue>[];
	onApplyFilterPreset: (value: OrderListFilterPresetValue) => void;
	onSaveFilterPreset: (name: string) => void;
	onDeleteFilterPreset: (id: string) => void;
};

export function OrderListFilterBar({
	search,
	onSearchChange,
	sort,
	onSortChange,
	statusFilter,
	onSelectStatus,
	onClearStatus,
	statusCounts,
	totalCount,
	bookmarkedOnly,
	onToggleBookmarkedOnly,
	viewMode,
	onViewModeChange,
	filterPresets,
	onApplyFilterPreset,
	onSaveFilterPreset,
	onDeleteFilterPreset,
}: OrderListFilterBarProps): React.ReactNode {
	const t = useTranslations("OrderList");
	const isAllActive = statusFilter === null;

	const statusLabels: Record<DisplayListingStatus, string> = {
		active: t("statusActive"),
		closed: t("statusClosed"),
		awarded: t("statusAwarded"),
		failed: t("statusFailed"),
	};

	const sortLabels: Record<SortOption, string> = {
		newest: t("sortNewest"),
		deadline: t("sortDeadline"),
	};

	return (
		<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
			<div className="flex flex-wrap items-center gap-2">
				<div className="border-hairline flex flex-wrap items-center gap-1 rounded-xl border bg-white p-1">
					<button
						onClick={onClearStatus}
						className={cn(
							"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
							isAllActive ? "bg-imsg-blue text-white" : "text-[#374151] hover:bg-[#F9FAFB]",
						)}>
						{t("statusAll")}
						<span className={cn("text-xs", isAllActive ? "text-white/70" : "text-subtle")}>
							{totalCount}
						</span>
					</button>
					{STATUS_VALUES.map((value) => {
						const isActive = statusFilter === value;
						return (
							<button
								key={value}
								onClick={() => onSelectStatus(value)}
								className={cn(
									"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
									isActive ? "bg-imsg-blue text-white" : "text-[#374151] hover:bg-[#F9FAFB]",
								)}>
								{statusLabels[value]}
								<span className={cn("text-xs", isActive ? "text-white/70" : "text-subtle")}>
									{statusCounts[value]}
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
									className="border-hairline absolute right-0 z-20 mt-2 w-40 rounded-2xl border bg-white p-1.5 shadow-lg">
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

				<button
					onClick={onToggleBookmarkedOnly}
					className={cn(
						"flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
						bookmarkedOnly
							? "border-amber-300 bg-amber-50 text-amber-600"
							: "border-hairline bg-white text-[#374151] hover:bg-[#F9FAFB]",
					)}>
					<Star size={14} fill={bookmarkedOnly ? "currentColor" : "none"} />
					{t("bookmarkedOnlyFilter")}
				</button>

				<FilterPresetsDropdown<OrderListFilterPresetValue>
					presets={filterPresets}
					currentValue={{ search, sort, statusFilter, bookmarkedOnly }}
					onApply={onApplyFilterPreset}
					onSave={onSaveFilterPreset}
					onDelete={onDeleteFilterPreset}
				/>
			</div>

			<ViewModeToggle value={viewMode} onChange={onViewModeChange} />
		</div>
	);
}
