"use client";

import { Clock, Package, MapPin } from "lucide-react";
import type { Currency } from "@/features/buyer/types";
import type { OpenListing } from "@/features/seller/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemainingText(endDate: string): { text: string; isUrgent: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { text: "마감됨", isUrgent: false };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { text: `마감 D-${days}`, isUrgent: days <= 3 };
}

type ListingBrowseCardProps = {
	listing: OpenListing;
	onClick: () => void;
};

export function ListingBrowseCard({ listing, onClick }: ListingBrowseCardProps) {
	const remaining = getRemainingText(listing.endDate);
	const symbol = CURRENCY_SYMBOL[listing.currency];
	const itemNames = listing.items.map((item) => item.name).filter(Boolean).join(", ");
	const location = [listing.deliveryCity, listing.deliveryProvinsi].filter(Boolean).join(", ");

	return (
		<button
			onClick={onClick}
			className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left transition-colors hover:bg-[#F9FAFB]"
		>
			<div className="mb-2 flex items-center gap-2">
				<span
					className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
						remaining.isUrgent
							? "bg-[#FEF2F2] text-[#DC2626]"
							: "bg-[#EFF6FF] text-[#3B82F6]"
					}`}
				>
					<Clock size={12} />
					{remaining.text}
				</span>
			</div>

			<p className="text-[15px] font-medium text-[#1F2937]">{listing.title}</p>

			{itemNames && (
				<p className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-[#6B7280]">
					<Package size={13} className="shrink-0" />
					{itemNames}
				</p>
			)}

			{location && (
				<p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
					<MapPin size={13} className="shrink-0" />
					{location}
				</p>
			)}

			<div className="mt-3 flex items-center gap-6 border-t border-[#F3F4F6] pt-3">
				<div>
					<p className="text-[11px] text-[#9CA3AF]">예산</p>
					<p className="text-[13px] font-medium text-[#1F2937]">
						{listing.budgetPublic
							? `${symbol} ${listing.totalBudget.toLocaleString()}`
							: "비공개"}
					</p>
				</div>
				<div>
					<p className="text-[11px] text-[#9CA3AF]">품목 수</p>
					<p className="text-[13px] font-medium text-[#1F2937]">{listing.items.length}개</p>
				</div>
			</div>
		</button>
	);
}