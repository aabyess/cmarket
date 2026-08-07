"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ArrowUpDown, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ListingStatus } from "@/features/buyer/types";

export type SortOption = "newest" | "deadline";
export type ViewMode = "grid" | "list";

const STATUS_OPTIONS: { value: ListingStatus; label: string }[] = [
	{ value: "active", label: "진행 중" },
	{ value: "closed", label: "마감" },
	{ value: "awarded", label: "낙찰 완료" },
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
	statusFilter: Set<ListingStatus>;
	onToggleStatus: (status: ListingStatus) => void;
	viewMode: ViewMode;
	onViewModeChange: (mode: ViewMode) => void;
};

export function OrderListFilterBar({
	search,
	onSearchChange,
	sort,
	onSortChange,
	statusFilter,
	onToggleStatus,
	viewMode,
	onViewModeChange,
}: OrderListFilterBarProps): React.ReactNode {
	const activeCount = statusFilter.size;

	return (
		<div className="mb-4 flex items-center justify-between gap-2">
			<div className="mx-auto flex w-fit items-center rounded-xl border border-[#E5E7EB] bg-white">
				<div className="flex items-center gap-2 px-3.5 py-2.5">
					<Search size={16} className="text-[#9CA3AF]" />
					<input
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="공고 검색"
						className="w-40 bg-transparent text-[14px] leading-none outline-none placeholder:text-[#9CA3AF]"
					/>
				</div>

				<div className="h-6 w-px bg-[#E5E7EB]" />

				<Popover className="relative">
					<PopoverButton
						className={cn(
							"flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors",
							activeCount > 0 ? "text-[#3B82F6]" : "text-[#374151] hover:bg-[#F9FAFB]",
						)}
					>
						<SlidersHorizontal size={14} />
						필터
						{activeCount > 0 && (
							<span className="flex size-4 items-center justify-center rounded-full bg-[#3B82F6] text-[10px] font-semibold text-white">
								{activeCount}
							</span>
						)}
					</PopoverButton>

					<PopoverPanel className="absolute left-0 z-20 mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-lg">
						<p className="mb-2 text-xs font-semibold text-[#9CA3AF]">상태</p>
						<div className="flex flex-wrap gap-1.5">
							{STATUS_OPTIONS.map((option) => {
								const isActive = statusFilter.has(option.value);
								return (
									<button
										key={option.value}
										onClick={() => onToggleStatus(option.value)}
										className={cn(
											"rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
											isActive
												? "bg-[#3B82F6] text-white"
												: "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]",
										)}
									>
										{option.label}
									</button>
								);
							})}
						</div>
					</PopoverPanel>
				</Popover>

				<div className="h-6 w-px bg-[#E5E7EB]" />

				<div className="flex items-center gap-1 px-2 py-1.5">
					{(Object.keys(SORT_LABEL) as SortOption[]).map((option) => (
						<button
							key={option}
							onClick={() => onSortChange(option)}
							className={cn(
								"rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
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