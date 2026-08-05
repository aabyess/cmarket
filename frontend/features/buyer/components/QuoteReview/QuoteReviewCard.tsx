"use client";

import { useState } from "react";
import { Building2, Truck, ChevronDown, MessageSquare } from "lucide-react";import { cn } from "@/utils/cn";
import type { Currency, QuoteStatus, ReceivedQuote } from "@/features/buyer/types";

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

type QuoteReviewCardProps = {
	quote: ReceivedQuote;
	isLowest: boolean;
	isFastest: boolean;
	hasAwarded: boolean;
	onAward: () => void;
	isAwarding: boolean;
};

export function QuoteReviewCard({
	quote,
	isLowest,
	isFastest,
	hasAwarded,
	onAward,
	isAwarding,
}: QuoteReviewCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const symbol = CURRENCY_SYMBOL[quote.currency];
	const status = STATUS_CONFIG[quote.status];

	return (
		<div
			className={cn(
				"rounded-2xl border bg-white p-5",
				quote.status === "awarded" ? "border-2 border-[#059669]" : "border-[#E5E7EB]",
			)}
		>
			<div className="mb-2 flex flex-wrap items-center gap-1.5">
				<span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", status.className)}>
					{status.label}
				</span>
				{isLowest && (
					<span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-medium text-[#D97706]">
						최저가
					</span>
				)}
				{isFastest && (
					<span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-medium text-[#16A34A]">
						최속납기
					</span>
				)}
			</div>

			<p className="flex items-center gap-1.5 text-[15px] font-medium text-[#1F2937]">
				<Building2 size={15} className="shrink-0 text-[#6B7280]" />
				{quote.seller.companyName}
			</p>

			<div className="mt-3 flex items-center gap-6 border-t border-[#F3F4F6] pt-3">
				<div>
					<p className="text-[11px] text-[#9CA3AF]">견적가</p>
					<p className="text-[17px] font-semibold text-[#1F2937]">
						{symbol} {quote.price.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
						<Truck size={11} />
						납품
					</p>
					<p className="text-[17px] font-semibold text-[#1F2937]">{quote.deliveryDays}일</p>
				</div>
			</div>

			{quote.note && (
				<p className="mt-3 whitespace-pre-wrap rounded-lg bg-[#F9FAFB] px-3 py-2.5 text-[13px] leading-relaxed text-[#374151]">
					{quote.note}
				</p>
			)}

			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="mt-3 flex w-full items-center justify-center gap-1 py-2 text-[13px] text-[#6B7280] transition-colors hover:text-[#374151]"
			>
				기업 정보 {isExpanded ? "접기" : "보기"}
				<ChevronDown
					size={14}
					className={cn("transition-transform", isExpanded && "rotate-180")}
				/>
			</button>

			{isExpanded && (
				<div className="space-y-2.5 rounded-lg bg-[#F9FAFB] p-4 text-[13px]">
					<div className="flex justify-between gap-4">
						<span className="shrink-0 text-[#6B7280]">대표자</span>
						<span className="text-right text-[#1F2937]">{quote.seller.representative || "-"}</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="shrink-0 text-[#6B7280]">업태 / 종목</span>
						<span className="text-right text-[#1F2937]">
							{[quote.seller.businessType, quote.seller.businessItem].filter(Boolean).join(" / ") || "-"}
						</span>
					</div>
					<div className="flex justify-between gap-4">
						<span className="shrink-0 text-[#6B7280]">소재지</span>
						<span className="text-right text-[#1F2937]">{quote.seller.address || "-"}</span>
					</div>
				</div>
			)}

			<button
				onClick={onAward}
				disabled={isAwarding}
				className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3B82F6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
			>
				<MessageSquare size={16} />
				{isAwarding ? "이동 중..." : "채팅으로 문의하기"}
			</button>
		</div>
	);
}