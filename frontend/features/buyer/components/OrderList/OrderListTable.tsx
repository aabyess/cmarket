"use client";

import { cn } from "@/utils/cn";
import type {
	Currency,
	ListingCategory,
	ListingStatus,
	ListingSummary,
} from "@/features/buyer/types";
import { CATEGORY_LABELS } from "@/features/buyer/constants";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_CONFIG: Record<ListingStatus, { label: string; className: string }> = {
	active: { label: "진행 중", className: "bg-[#EFF6FF] text-imsg-blue" },
	closed: { label: "마감", className: "bg-[#F3F4F6] text-[#6B7280]" },
	awarded: { label: "계약 확정", className: "bg-[#ECFDF5] text-[#059669]" },
};

function formatDate(iso: string): string {
	const date = new Date(iso);
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function getRemainingText(endDate: string): { text: string; isUrgent: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { text: "마감됨", isUrgent: false };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { text: `D-${days}`, isUrgent: days <= 3 };
}

type OrderListTableProps = {
	listings: ListingSummary[];
	onSelect: (id: string) => void;
};

export function OrderListTable({ listings, onSelect }: OrderListTableProps): React.ReactNode {
	return (
		<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-medium text-[#9CA3AF]">
							<th className="px-4 py-3">상태</th>
							<th className="px-4 py-3">공고명</th>
							<th className="px-4 py-3">카테고리</th>
							<th className="px-4 py-3">예산</th>
							<th className="px-4 py-3">받은 견적</th>
							<th className="px-4 py-3">마감</th>
							<th className="px-4 py-3">등록일</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F3F4F6]">
						{listings.map((listing) => {
							const status = STATUS_CONFIG[listing.status];
							const symbol = CURRENCY_SYMBOL[listing.currency];
							const remaining = getRemainingText(listing.endDate);
							const categoryLabel = listing.category ? CATEGORY_LABELS[listing.category] : null;

							return (
								<tr
									key={listing.id}
									onClick={() => onSelect(listing.id)}
									className="cursor-pointer transition-colors hover:bg-[#F9FAFB]">
									<td className="px-4 py-3">
										<span
											className={cn(
												"rounded-full px-2.5 py-1 text-xs font-medium",
												status.className,
											)}>
											{status.label}
										</span>
									</td>
									<td className="max-w-[240px] truncate px-4 py-3 font-medium text-[#1F2937]">
										{listing.title}
									</td>
									<td className="px-4 py-3 text-[#6B7280]">{categoryLabel ?? "-"}</td>
									<td className="px-4 py-3 text-[#1F2937]">
										{listing.budgetPublic
											? `${symbol} ${listing.totalBudget.toLocaleString()}`
											: "비공개"}
									</td>
									<td className="px-4 py-3 text-[#1F2937]">{listing.quoteCount}건</td>
									<td
										className={cn(
											"px-4 py-3",
											remaining.isUrgent ? "font-medium text-[#DC2626]" : "text-[#6B7280]",
										)}>
										{remaining.text}
									</td>
									<td className="px-4 py-3 text-[#9CA3AF]">{formatDate(listing.createdAt)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
