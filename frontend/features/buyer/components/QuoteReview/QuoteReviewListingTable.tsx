"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";
import { getCategoryLabels } from "@/features/buyer/constants";
import type { Currency, ListingWithQuotes } from "@/features/buyer/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemaining(endDate: string): { days: number; isUrgent: boolean; isClosed: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { days: 0, isUrgent: false, isClosed: true };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { days, isUrgent: days <= 3, isClosed: false };
}

type QuoteReviewListingTableProps = {
	listings: ListingWithQuotes[];
};

export function QuoteReviewListingTable({ listings }: QuoteReviewListingTableProps): React.ReactNode {
	const t = useTranslations("QuoteReviewListingTable");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));
	const router = useRouter();

	return (
		<div className="border-hairline overflow-hidden rounded-2xl border bg-white">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-hairline text-subtle border-b bg-[#F9FAFB] text-left text-xs font-medium">
						<th className="px-4 py-3">{t("columnStatus")}</th>
						<th className="px-4 py-3">{t("columnTitle")}</th>
						<th className="px-4 py-3">{t("columnCategory")}</th>
						<th className="px-4 py-3">{t("columnQuoteCount")}</th>
						<th className="px-4 py-3">{t("columnLowestPrice")}</th>
						<th className="px-4 py-3">{t("columnFastestDelivery")}</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-[#F3F4F6]">
					{listings.map((listing) => {
						const remaining = getRemaining(listing.endDate);
						const symbol = CURRENCY_SYMBOL[listing.currency];
						const hasQuotes = listing.quoteCount > 0;
						const isAwarded = listing.status === "awarded";

						return (
							<tr
								key={listing.id}
								onClick={() => router.push(`/buyer/quote-review?listingId=${listing.id}`)}
								className={cn(
									"cursor-pointer transition-colors hover:bg-[#F9FAFB]",
									!hasQuotes && "opacity-60",
								)}
							>
								<td className="px-4 py-3">
									{isAwarded ? (
										<motion.span
											layoutId={`quote-review-listing-status-${listing.id}`}
											transition={{ type: "spring", stiffness: 300, damping: 30 }}
											className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-medium text-[#16A34A]"
										>
											{t("awardedBadge")}
										</motion.span>
									) : (
										<motion.span
											layoutId={`quote-review-listing-status-${listing.id}`}
											transition={{ type: "spring", stiffness: 300, damping: 30 }}
											className={cn(
												"whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
												remaining.isClosed
													? "text-muted bg-[#F3F4F6]"
													: remaining.isUrgent
														? "bg-[#FEF2F2] text-[#DC2626]"
														: "bg-[#EFF6FF] text-imsg-blue",
											)}
										>
											{remaining.isClosed ? t("closed") : t("deadlineDays", { days: remaining.days })}
										</motion.span>
									)}
								</td>
								<td className="text-ink max-w-[320px] truncate px-4 py-3 font-medium">
									{listing.title}
								</td>
								<td className="px-4 py-3 text-muted">
									{categoryLabels[listing.category]}
								</td>
								<td className="px-4 py-3 text-ink">
									{hasQuotes ? t("quoteCount", { count: listing.quoteCount }) : t("noQuotes")}
								</td>
								<td className="text-ink px-4 py-3">
									{hasQuotes ? `${symbol} ${listing.lowestPrice?.toLocaleString()}` : "-"}
								</td>
								<td className="text-ink px-4 py-3">
									{hasQuotes ? t("days", { count: listing.fastestDays ?? 0 }) : "-"}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
