"use client";

import { LayoutGrid, List, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ListingStatus } from "@/features/buyer/types";

export type SortOption = "newest" | "deadline";
export type ViewMode = "grid" | "list";

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
	{ value: "active", label: "진행 중" },
	{ value: "closed", label: "마감" },
	{ value: "awarded", label: "계약 확정" },
];

const SORT_LABEL: Record<SortOption, string> = {
	newest: "최신순",
	deadline: "마감순",
};

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
	const isAllActive = statusFilter === null;

	return (
		<div className="mb-4 flex items-center justify-between gap-2">
			<div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				<button
					onClick={onClearStatus}
					className={cn(
						"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
						isAllActive
							? "bg-[#3B82F6] text-white"
							: "text-[#374151] hover:bg-[#F9FAFB]",
					)}
				>
					전체
					<span className={cn("text-xs", isAllActive ? "text-white/70" : "text-[#9CA3AF]")}>
						{totalCount}
					</span>
				</button>
				{STATUS_OPTIONS.map((option) => {
					const isActive = statusFilter === option.value;
					return (
						<button
							key={option.value}
							onClick={() => onSelectStatus(option.value)}
							className={cn(
								"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
								isActive
									? "bg-[#3B82F6] text-white"
									: "text-[#374151] hover:bg-[#F9FAFB]",
							)}
						>
							{option.label}
							<span className={cn("text-xs", isActive ? "text-white/70" : "text-[#9CA3AF]")}>
								{statusCounts[option.value]}
							</span>
						</button>
					);
				})}

				<div className="mx-1 h-6 w-px bg-[#E5E7EB]" />

				<div className="flex items-center gap-2 px-2 py-1">
					<Search size={16} className="text-[#9CA3AF]" />
					<input
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="견적요청 검색"
						className="w-36 bg-transparent text-sm leading-none outline-none placeholder:text-[#9CA3AF]"
					/>
				</div>

				<div className="mx-1 h-6 w-px bg-[#E5E7EB]" />

				<div className="flex items-center gap-1">
					{(Object.keys(SORT_LABEL) as SortOption[]).map((option) => (
						<button
							key={option}
							onClick={() => onSortChange(option)}
							className={cn(
								"rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
								sort === option
									? "bg-[#3B82F6] text-white"
									: "text-[#374151] hover:bg-[#F9FAFB]",
							)}
						>
							{SORT_LABEL[option]}
						</button>
					))}
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				<button
					onClick={() => onViewModeChange("grid")}
					className={cn(
						"flex size-8 items-center justify-center rounded-lg transition-colors",
						viewMode === "grid" ? "bg-[#3B82F6] text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
					)}
				>
					<LayoutGrid size={15} />
				</button>
				<button
					onClick={() => onViewModeChange("list")}
					className={cn(
						"flex size-8 items-center justify-center rounded-lg transition-colors",
						viewMode === "list" ? "bg-[#3B82F6] text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
					)}
				>
					<List size={15} />
				</button>
			</div>
		</div>
	);
}