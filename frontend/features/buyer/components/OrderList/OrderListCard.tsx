"use client";

import { Clock, Package } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency, ListingStatus, ListingSummary } from "@/features/buyer/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_CONFIG: Record<ListingStatus, { label: string; className: string }> = {
	active: { label: "진행 중", className: "bg-[#EFF6FF] text-[#3B82F6]" },
	closed: { label: "마감", className: "bg-[#F3F4F6] text-[#6B7280]" },
	awarded: { label: "낙찰 완료", className: "bg-[#ECFDF5] text-[#059669]" },
};

function getRemainingText(endDate: string): string {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return "마감됨";

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return `마감 D-${days}`;
}

type OrderListCardProps = {
	listing: ListingSummary;
	onClick: () => void;
};

export function OrderListCard({ listing, onClick }: OrderListCardProps) {
	const status = STATUS_CONFIG[listing.status];
	const symbol = CURRENCY_SYMBOL[listing.currency];
	const itemNames = listing.items.map((item) => item.name).filter(Boolean).join(", ");

	return (
		<button
			onClick={onClick}
			className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left transition-colors hover:bg-[#F9FAFB]"
		>
			<div className="mb-2 flex items-center gap-2">
				<span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", status.className)}>
					{status.label}
				</span>
				<span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
					<Clock size={13} />
					{getRemainingText(listing.endDate)}
				</span>
			</div>

			<p className="text-[15px] font-medium text-[#1F2937]">{listing.title}</p>

			{itemNames && (
				<p className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-[#6B7280]">
					<Package size={13} className="shrink-0" />
					{itemNames}
				</p>
			)}

			<div className="mt-3 flex items-center gap-4 border-t border-[#F3F4F6] pt-3">
				<div>
					<p className="text-[11px] text-[#9CA3AF]">예산</p>
					<p className="text-[13px] font-medium text-[#1F2937]">
						{listing.budgetPublic
							? `${symbol} ${listing.totalBudget.toLocaleString()}`
							: "비공개"}
					</p>
				</div>
				<div>
					<p className="text-[11px] text-[#9CA3AF]">받은 견적</p>
					<p className="text-[13px] font-medium text-[#1F2937]">{listing.quoteCount}건</p>
				</div>
			</div>
		</button>
	);
}