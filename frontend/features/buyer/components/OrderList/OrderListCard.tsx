"use client";

import { Clock, MessageSquare, Package } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency, ListingCategory, ListingStatus, ListingSummary } from "@/features/buyer/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_CONFIG: Record <
	ListingStatus,
	{ label: string; className: string; dotClassName: string }
> = {
	active: { label: "진행 중", className: "bg-[#EFF6FF] text-[#3B82F6]", dotClassName: "bg-[#3B82F6]" },
	closed: { label: "마감", className: "bg-[#F3F4F6] text-[#6B7280]", dotClassName: "bg-[#9CA3AF]" },
	awarded: {
		label: "낙찰 완료",
		className: "bg-[#ECFDF5] text-[#059669]",
		dotClassName: "bg-[#059669]",
	},
};

const CATEGORY_LABEL: Record<ListingCategory, string> = {
	office: "사무용품",
	lab: "연구장비",
	machinery: "산업기계",
	chemical: "화학약품",
};

function getRemainingText(endDate: string): { text: string; isUrgent: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { text: "마감됨", isUrgent: false };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { text: `마감 D-${days}`, isUrgent: days <= 3 };
}

function formatDate(iso: string): string {
	const date = new Date(iso);
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} 등록`;
}

type OrderListCardProps = {
	listing: ListingSummary;
	onClick: () => void;
};

export function OrderListCard({ listing, onClick }: OrderListCardProps): React.ReactNode {
	const status = STATUS_CONFIG[listing.status];
	const symbol = CURRENCY_SYMBOL[listing.currency];
	const itemNames = listing.items.map((item) => item.name).filter(Boolean).join(", ");
	const remaining = getRemainingText(listing.endDate);

	return (
		<button
			onClick={onClick}
			className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
		>
			<div className="mb-2.5 flex items-center gap-2">
				<span
					className={cn(
						"flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
						status.className,
					)}
				>
					<span className={cn("size-1.5 rounded-full", status.dotClassName)} />
					{status.label}
				</span>
				{listing.category && CATEGORY_LABEL[listing.category] && (
					<span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
						{CATEGORY_LABEL[listing.category]}
					</span>
				)}
				<span
					className={cn(
						"ml-auto flex items-center gap-1 text-xs",
						remaining.isUrgent ? "font-medium text-[#DC2626]" : "text-[#9CA3AF]",
					)}
				>
					<Clock size={13} />
					{remaining.text}
				</span>
			</div>

			<p className="text-[15px] font-semibold text-[#1F2937]">{listing.title}</p>

			{itemNames && (
				<p className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-[#6B7280]">
					<Package size={13} className="shrink-0" />
					{itemNames}
				</p>
			)}

			<p className="mt-1.5 text-[11px] text-[#9CA3AF]">{formatDate(listing.createdAt)}</p>

			<div className="mt-3.5 flex items-center gap-5 border-t border-[#F3F4F6] pt-3.5">
				<div>
					<p className="text-[11px] text-[#9CA3AF]">예산</p>
					<p className="text-[13px] font-semibold text-[#1F2937]">
						{listing.budgetPublic
							? `${symbol} ${listing.totalBudget.toLocaleString()}`
							: "비공개"}
					</p>
				</div>
				<div>
					<p className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
						<MessageSquare size={11} />
						받은 견적
					</p>
					<p className="text-[13px] font-semibold text-[#1F2937]">{listing.quoteCount}건</p>
				</div>
			</div>
		</button>
	);
}