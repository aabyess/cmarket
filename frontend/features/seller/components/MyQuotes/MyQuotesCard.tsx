"use client";

import { useTranslations } from "next-intl";
import { Building2, Truck, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency } from "@/features/buyer/types";
import type { MyQuote, QuoteStatus } from "@/features/seller/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_CLASS_NAME: Record<QuoteStatus, string> = {
	pending: "bg-[#EFF6FF] text-imsg-blue",
	awarded: "bg-[#ECFDF5] text-[#059669]",
	rejected: "bg-[#F3F4F6] text-[#6B7280]",
};

function formatDate(iso: string): string {
	const date = new Date(iso);
	return `${date.getMonth() + 1}.${date.getDate()}`;
}

type MyQuotesCardProps = {
	quote: MyQuote;
	onViewListing: () => void;
	onGoToChat: () => void;
};

export function MyQuotesCard({ quote, onViewListing, onGoToChat }: MyQuotesCardProps) {
	const t = useTranslations("MyQuotesCard");
	const statusLabels: Record<QuoteStatus, string> = {
		pending: t("statusPending"),
		awarded: t("statusAwarded"),
		rejected: t("statusRejected"),
	};
	const statusClassName = STATUS_CLASS_NAME[quote.status];
	const symbol = CURRENCY_SYMBOL[quote.currency];
	const isAwarded = quote.status === "awarded";

	return (
		<div
			className={cn(
				"flex flex-col rounded-2xl border bg-white p-4",
				isAwarded ? "border-2 border-[#059669]" : "border-[#E5E7EB]",
			)}
		>
			<div className="mb-2 flex items-start justify-between gap-2">
				<span className={cn("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", statusClassName)}>
					{statusLabels[quote.status]}
				</span>
				<span className="flex shrink-0 items-center gap-1 text-xs text-[#9CA3AF]">
					<Clock size={11} />
					{formatDate(quote.createdAt)}
				</span>
			</div>

			<p className="line-clamp-2 min-h-[42px] text-sm font-medium leading-snug text-[#1F2937]">
				{quote.listingTitle}
			</p>

			<p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-[#6B7280]">
				<Building2 size={12} className="shrink-0" />
				<span className="truncate">{quote.buyerCompanyName}</span>
			</p>

			<div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F3F4F6] pt-3">
				<div className="min-w-0">
					<p className="text-xs text-[#9CA3AF]">{t("priceLabel")}</p>
					<p className="mt-0.5 truncate text-sm font-medium text-[#1F2937]">
						{symbol} {quote.price.toLocaleString()}
					</p>
				</div>
				<div className="min-w-0">
					<p className="flex items-center gap-1 text-xs text-[#9CA3AF]">
						<Truck size={11} />
						{t("deliveryLabel")}
					</p>
					<p className="mt-0.5 text-sm font-medium text-[#1F2937]">
						{t("daysSuffix", { days: quote.deliveryDays })}
					</p>
				</div>
			</div>

			<div className="mt-3 flex gap-2">
				<button
					onClick={onViewListing}
					className="flex-1 rounded-lg border border-[#E5E7EB] py-2.5 text-xs font-medium text-[#374151] transition-colors hover:bg-gray-50"
				>
					{t("viewListingButton")}
				</button>
				{isAwarded && (
					<button
						onClick={onGoToChat}
						className="flex-1 rounded-lg bg-imsg-blue py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB]"
					>
						{t("chatButton")}
					</button>
				)}
			</div>
		</div>
	);
}