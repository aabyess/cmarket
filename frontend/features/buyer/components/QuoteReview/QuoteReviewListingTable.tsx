"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
		<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-medium text-[#9CA3AF]">
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
										<span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-medium text-[#059669]">
											{t("awardedBadge")}
										</span>
									) : (
										<span
											className={cn(
												"whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
												remaining.isClosed
													? "bg-[#F3F4F6] text-[#6B7280]"
													: remaining.isUrgent
														? "bg-[#FEF2F2] text-[#DC2626]"
														: "bg-[#EFF6FF] text-imsg-blue",
											)}
										>
											{remaining.isClosed ? t("closed") : t("deadlineDays", { days: remaining.days })}
										</span>
									)}
								</td>
								<td className="max-w-[320px] truncate px-4 py-3 font-medium text-[#1F2937]">
									{listing.title}
								</td>
								<td className="px-4 py-3 text-[#6B7280]">
									{categoryLabels[listing.category]}
								</td>
								<td className="px-4 py-3 text-[#1F2937]">
									{hasQuotes ? t("quoteCount", { count: listing.quoteCount }) : t("noQuotes")}
								</td>
								<td className="px-4 py-3 text-[#1F2937]">
									{hasQuotes ? `${symbol} ${listing.lowestPrice?.toLocaleString()}` : "-"}
								</td>
								<td className="px-4 py-3 text-[#1F2937]">
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
