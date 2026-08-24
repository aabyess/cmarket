"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";
import { Building2, MessageSquare } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { getDisplayQuoteStatus, type DisplayQuoteStatus } from "@/utils/getDisplayQuoteStatus";
import type { MyQuote } from "@/features/seller/types";

type MyQuotesTableProps = {
	quotes: MyQuote[];
	onViewListing: (listingId: string) => void;
	onGoToChat: (quoteId: string) => void;
};

const statusChip = cva("whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold", {
	variants: {
		status: {
			pending: "bg-[#EFF6FF] text-imsg-blue",
			awarded: "bg-[#F0FDF4] text-[#16A34A]",
			rejected: "bg-[#F3F4F6] text-muted",
			failed: "bg-[#F3F4F6] text-muted",
		},
	},
	defaultVariants: { status: "pending" },
});

export function MyQuotesTable({
	quotes,
	onViewListing,
	onGoToChat,
}: MyQuotesTableProps): React.JSX.Element {
	const t = useTranslations("MyQuotesTable");
	const locale = useLocale();
	const statusLabels: Record<DisplayQuoteStatus, string> = {
		pending: t("statusPending"),
		awarded: t("statusAwarded"),
		rejected: t("statusRejected"),
		failed: t("statusFailed"),
	};

	return (
		<div className="overflow-hidden rounded-2xl bg-white shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="bg-[#FAFAFC]">
						<tr className="text-imsg-secondary text-xs">
							<th className="px-4 py-3 font-medium whitespace-nowrap">{t("columnStatus")}</th>
							<th className="px-4 py-3 font-medium">{t("columnListing")}</th>
							<th className="px-4 py-3 font-medium">{t("columnBuyer")}</th>
							<th className="px-4 py-3 text-right font-medium whitespace-nowrap">
								{t("columnPrice")}
							</th>
							<th className="px-4 py-3 text-right font-medium whitespace-nowrap">
								{t("columnDelivery")}
							</th>
							<th className="px-4 py-3 text-right font-medium whitespace-nowrap">
								{t("columnSubmittedAt")}
							</th>
							<th className="px-4 py-3" />
						</tr>
					</thead>
					<tbody>
						{quotes.map((quote) => {
							const displayStatus = getDisplayQuoteStatus(quote.status, quote.listingEndDate);
							return (
								<tr key={quote.id} className="hover:bg-imsg-surface border-t border-[#F2F2F7]">
									<td className="px-4 py-3 whitespace-nowrap">
										<motion.span
											layoutId={`quote-status-${quote.id}`}
											transition={{ type: "spring", stiffness: 300, damping: 30 }}
											className={statusChip({ status: displayStatus })}>
											{statusLabels[displayStatus]}
										</motion.span>
									</td>
									<td className="px-4 py-3">
										<button
											type="button"
											onClick={() => onViewListing(quote.listingId)}
											className="max-w-[22rem] truncate text-left font-medium text-[#0f172a] hover:underline">
											{quote.listingTitle}
										</button>
									</td>
									<td className="px-4 py-3">
										<span className="text-imsg-secondary flex items-center gap-1.5">
											<Building2 size={13} className="shrink-0" />
											<span className="max-w-[14rem] truncate">{quote.buyerCompanyName}</span>
										</span>
									</td>
									<td className="px-4 py-3 text-right font-semibold whitespace-nowrap text-[#0f172a]">
										{CURRENCY_SYMBOL[quote.currency]} {quote.price.toLocaleString()}
									</td>
									<td className="px-4 py-3 text-right whitespace-nowrap text-[#374151]">
										{t("daysSuffix", { days: quote.deliveryDays })}
									</td>
									<td className="text-imsg-secondary px-4 py-3 text-right whitespace-nowrap">
										{new Date(quote.createdAt).toLocaleDateString(locale)}
									</td>
									<td className="px-4 py-3 text-right whitespace-nowrap">
										{quote.status === "awarded" && (
											<button
												type="button"
												onClick={() => onGoToChat(quote.id)}
												className="bg-imsg-blue inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-blue-600">
												<MessageSquare size={12} />
												{t("chatButton")}
											</button>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
