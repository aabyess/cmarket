"use client";

import { Clock, Package, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency } from "@/features/buyer/types";
import type { OpenListing } from "@/features/seller/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemaining(endDate: string): { text: string; isUrgent: boolean; isClosed: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { text: "마감", isUrgent: false, isClosed: true };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { text: `D-${days}`, isUrgent: days <= 3, isClosed: false };
}

type ListingBrowseCardProps = {
	listing: OpenListing;
	onClick: () => void;
};

export function ListingBrowseCard({ listing, onClick }: ListingBrowseCardProps) {
	const remaining = getRemaining(listing.endDate);
	const symbol = CURRENCY_SYMBOL[listing.currency];
	const itemNames = listing.items.map((item) => item.name).filter(Boolean).join(", ");
	const location = [listing.deliveryCity, listing.deliveryProvinsi].filter(Boolean).join(", ");

	return (
		<button
			onClick={onClick}
			className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:border-[#BFDBFE] hover:shadow-sm"
		>
			<div className="mb-2 flex items-start justify-between gap-2">
				<span
					className={cn(
						"flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
						remaining.isClosed
							? "bg-[#F3F4F6] text-[#6B7280]"
							: remaining.isUrgent
								? "bg-[#FEF2F2] text-[#DC2626]"
								: "bg-[#EFF6FF] text-[#3B82F6]",
					)}
				>
					<Clock size={11} />
					{remaining.text}
				</span>

				{listing.hasMyQuote && (
					<span className="flex shrink-0 items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-medium text-[#059669]">
						<CheckCircle2 size={11} />
						견적 보냄
					</span>
				)}
			</div>

			<p className="line-clamp-2 min-h-[42px] text-[15px] font-medium leading-snug text-[#1F2937]">
				{listing.title}
			</p>

			{itemNames && (
				<p className="mt-1.5 flex items-center gap-1.5 truncate text-[13px] text-[#6B7280]">
					<Package size={12} className="shrink-0" />
					<span className="truncate">{itemNames}</span>
				</p>
			)}

			<div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F3F4F6] pt-3">
				<div className="min-w-0">
					<p className="text-[11px] text-[#9CA3AF]">예산</p>
					<p className="mt-0.5 truncate text-[14px] font-medium text-[#1F2937]">
						{listing.budgetPublic
							? `${symbol} ${listing.totalBudget.toLocaleString()}`
							: "비공개"}
					</p>
				</div>
				<div className="min-w-0">
					<p className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
						<MapPin size={11} />
						배송지
					</p>
					<p className="mt-0.5 truncate text-[14px] font-medium text-[#1F2937]">
						{location || "-"}
					</p>
				</div>
			</div>
		</button>
	);
}