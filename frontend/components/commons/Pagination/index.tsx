"use client";

import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type PaginationProps = {
	page: number;
	pageCount: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	pageSizeOptions?: number[];
};

export function Pagination({
	page,
	pageCount,
	pageSize,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps): React.ReactNode {
	const t = useTranslations("Pagination");

	return (
		<div className="relative mt-4 flex items-center justify-center">
			<select
				value={pageSize}
				onChange={(e) => onPageSizeChange(Number(e.target.value))}
				className="absolute left-0 rounded-lg border border-[#E2E8F0] py-1.5 pl-3 text-xs text-[#374151] focus:border-imsg-blue focus:outline-none"
			>
				{pageSizeOptions.map((size) => (
					<option key={size} value={size}>
						{t("perPage", { size })}
					</option>
				))}
			</select>

			<div className="flex items-center gap-1">
				<button
					onClick={() => onPageChange(1)}
					disabled={page === 1}
					className="flex size-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:opacity-30"
				>
					<ChevronFirst size={16} />
				</button>
				<button
					onClick={() => onPageChange(page - 1)}
					disabled={page === 1}
					className="flex size-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:opacity-30"
				>
					<ChevronLeft size={16} />
				</button>
				<span className="px-2 text-xs text-[#374151]">
					{page} / {pageCount}
				</span>
				<button
					onClick={() => onPageChange(page + 1)}
					disabled={page === pageCount}
					className="flex size-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:opacity-30"
				>
					<ChevronRight size={16} />
				</button>
				<button
					onClick={() => onPageChange(pageCount)}
					disabled={page === pageCount}
					className="flex size-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F9FAFB] disabled:opacity-30"
				>
					<ChevronLast size={16} />
				</button>
			</div>
		</div>
	);
}