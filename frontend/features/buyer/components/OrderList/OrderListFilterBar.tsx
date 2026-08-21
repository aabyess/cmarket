"use client";

import { useTranslations } from "next-intl";
import { Popover, PopoverButton } from "@headlessui/react";
import { ArrowUpDown, Search } from "lucide-react";
import { AnimatedPopoverPanel } from "@/components/commons/AnimatedPopoverPanel";
import { cn } from "@/utils/cn";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import type { ListingStatus } from "@/features/buyer/types";

export type SortOption = "newest" | "deadline";
export type { ViewMode };

const STATUS_VALUES: ListingStatus[] = ["active", "closed", "awarded"];

const SORT_VALUES: SortOption[] = ["newest", "deadline"];

type OrderListFilterBarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	sort: SortOption;
	onSortChange: (value: SortOption) => void;
	statusFilter: ListingStatus | null;
	onSelectStatus: (status: ListingStatus) => void;
	onClearStatus: () => void;
	statusCounts: Record<ListingStatus, number>;
	totalCount: number;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
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
	viewMode,
	onViewModeChange,
}: OrderListFilterBarProps): React.ReactNode {
	const t = useTranslations("OrderList");
	const isAllActive = statusFilter === null;

	const statusLabels: Record<ListingStatus, string> = {
		active: t("statusActive"),
		closed: t("statusClosed"),
		awarded: t("statusAwarded"),
	};

	const sortLabels: Record<SortOption, string> = {
		newest: t("sortNewest"),
		deadline: t("sortDeadline"),
	};

	return (
		<div className="mb-4 flex items-center justify-between gap-2">
			<div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				<button
					onClick={onClearStatus}
					className={cn(
						"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
						isAllActive
							? "bg-imsg-blue text-white"
							: "text-[#374151] hover:bg-[#F9FAFB]",
					)}
				>
					{t("statusAll")}
					<span className={cn("text-xs", isAllActive ? "text-white/70" : "text-[#9CA3AF]")}>
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
								isActive
									? "bg-imsg-blue text-white"
									: "text-[#374151] hover:bg-[#F9FAFB]",
							)}
						>
							{statusLabels[value]}
							<span className={cn("text-xs", isActive ? "text-white/70" : "text-[#9CA3AF]")}>
								{statusCounts[value]}
							</span>
						</button>
					);
				})}

				<div className="mx-1 h-6 w-px bg-[#E5E7EB]" />

				<div className="flex items-center gap-2 px-2 py-1">
					<Search size={16} className="shrink-0 text-[#9CA3AF]" />
					<input
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder={t("searchPlaceholder")}
						className="w-32 bg-transparent text-sm leading-none outline-none placeholder:text-[#9CA3AF]"
					/>
				</div>

				<div className="mx-1 h-6 w-px bg-[#E5E7EB]" />

				<Popover className="relative">
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
								<ArrowUpDown size={14} />
								{sortLabels[sort]}
							</PopoverButton>

							<AnimatedPopoverPanel
								open={open}
								className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
								{SORT_VALUES.map((option) => (
									<button
										key={option}
										onClick={() => onSortChange(option)}
										className={cn(
											"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
											sort === option
												? "bg-[#EFF6FF] text-imsg-blue"
												: "text-[#374151] hover:bg-[#F9FAFB]",
										)}
									>
										{sortLabels[option]}
									</button>
								))}
							</AnimatedPopoverPanel>
						</>
					)}
				</Popover>
			</div>

			<ViewModeToggle value={viewMode} onChange={onViewModeChange} />
		</div>
	);
}
