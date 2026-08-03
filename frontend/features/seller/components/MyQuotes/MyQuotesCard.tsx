"use client";

import { Building2, Truck, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency } from "@/features/buyer/types";
import type { MyQuote, QuoteStatus } from "@/features/seller/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_CONFIG: Record<QuoteStatus, { label: string; className: string }> = {
	pending: { label: "검토 중", className: "bg-[#EFF6FF] text-[#3B82F6]" },
	awarded: { label: "낙찰", className: "bg-[#ECFDF5] text-[#059669]" },
	rejected: { label: "미선정", className: "bg-[#F3F4F6] text-[#6B7280]" },
};

function formatDate(iso: string): string {
	const date = new Date(iso);
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

type MyQuotesCardProps = {
	quote: MyQuote;
	onViewListing: () => void;
	onGoToChat: () => void;
};

export function MyQuotesCard({ quote, onViewListing, onGoToChat }: MyQuotesCardProps) {
	const status = STATUS_CONFIG[quote.status];
	const symbol = CURRENCY_SYMBOL[quote.currency];

	return (
		<div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
			<div className="mb-2 flex items-center gap-2">
				<span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", status.className)}>
					{status.label}
				</span>
				<span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
					<Clock size={12} />
					{formatDate(quote.createdAt)} 제출
				</span>
			</div>

			<p className="text-[15px] font-medium text-[#1F2937]">{quote.listingTitle}</p>

			<p className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
				<Building2 size={13} className="shrink-0" />
				{quote.buyerCompanyName}
			</p>

			<div className="mt-3 flex items-center gap-6 border-t border-[#F3F4F6] pt-3">
				<div>
					<p className="text-[11px] text-[#9CA3AF]">내 견적가</p>
					<p className="text-[15px] font-medium text-[#1F2937]">
						{symbol} {quote.price.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
						<Truck size={11} />
						납품
					</p>
					<p className="text-[15px] font-medium text-[#1F2937]">{quote.deliveryDays}일</p>
				</div>
			</div>

			{quote.note && (
				<p className="mt-3 truncate rounded-lg bg-[#F9FAFB] px-3 py-2 text-xs text-[#6B7280]">
					{quote.note}
				</p>
			)}

			<div className="mt-3 flex gap-2">
				<button
					onClick={onViewListing}
					className="flex-1 rounded-lg border border-[#E5E7EB] py-2.5 text-[13px] font-medium text-[#374151] transition-colors hover:bg-gray-50"
				>
					공고 보기
				</button>
				{quote.status === "awarded" && (
					<button
						onClick={onGoToChat}
						className="flex-1 rounded-lg bg-[#3B82F6] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2563EB]"
					>
						발주기관과 대화하기
					</button>
				)}
			</div>
		</div>
	);
}