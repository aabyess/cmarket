"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency, ListingSummary } from "@/features/buyer/types";
import { getCategoryLabels } from "@/features/buyer/constants";
import {
	getDisplayListingStatus,
	type DisplayListingStatus,
} from "@/utils/getDisplayListingStatus";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_STYLE: Record<DisplayListingStatus, string> = {
	active: "bg-[#EFF6FF] text-imsg-blue",
	closed: "bg-[#F3F4F6] text-muted",
	awarded: "bg-[#F0FDF4] text-[#16A34A]",
	failed: "bg-[#F3F4F6] text-muted",
};

function formatDate(iso: string): string {
	const date = new Date(iso);
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function getRemainingInfo(endDate: string): { isClosed: boolean; days: number; isUrgent: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { isClosed: true, days: 0, isUrgent: false };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { isClosed: false, days, isUrgent: days <= 3 };
}

type OrderListTableProps = {
	listings: ListingSummary[];
	onSelect: (id: string) => void;
	onOpenBookmarks: (id: string) => void;
};

export function OrderListTable({
	listings,
	onSelect,
	onOpenBookmarks,
}: OrderListTableProps): React.ReactNode {
	const t = useTranslations("OrderListTable");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));
	const statusLabels: Record<DisplayListingStatus, string> = {
		active: t("statusActive"),
		closed: t("statusClosed"),
		awarded: t("statusAwarded"),
		failed: t("statusFailed"),
	};

	return (
		<div className="border-hairline overflow-hidden rounded-2xl border bg-white">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-hairline text-subtle border-b bg-[#F9FAFB] text-left text-xs font-medium">
							<th className="px-4 py-3">{t("columnStatus")}</th>
							<th className="px-4 py-3">{t("columnTitle")}</th>
							<th className="px-4 py-3">{t("columnCategory")}</th>
							<th className="px-4 py-3">{t("columnBudget")}</th>
							<th className="px-4 py-3">{t("columnQuoteCount")}</th>
							<th className="px-4 py-3">{t("columnDeadline")}</th>
							<th className="px-4 py-3">{t("columnCreatedAt")}</th>
							<th className="px-4 py-3">
								<span className="sr-only">{t("columnBookmark")}</span>
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F3F4F6]">
						{listings.map((listing) => {
							const displayStatus = getDisplayListingStatus(
								listing.status,
								listing.endDate,
								listing.status === "awarded",
							);
							const statusClassName = STATUS_STYLE[displayStatus];
							const symbol = CURRENCY_SYMBOL[listing.currency];
							const remaining = getRemainingInfo(listing.endDate);
							const remainingText = remaining.isClosed
								? t("closed")
								: t("deadlineDays", { days: remaining.days });
							const categoryLabel = listing.category ? categoryLabels[listing.category] : null;

							return (
								<tr
									key={listing.id}
									onClick={() => onSelect(listing.id)}
									className="cursor-pointer transition-colors hover:bg-[#F9FAFB]">
									<td className="px-4 py-3">
										<motion.span
											layoutId={`listing-status-${listing.id}`}
											transition={{ type: "spring", stiffness: 300, damping: 30 }}
											className={cn(
												"rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
												statusClassName,
											)}>
											{statusLabels[displayStatus]}
										</motion.span>
									</td>
									<td className="text-ink max-w-[240px] truncate px-4 py-3 font-medium">
										{listing.title}
									</td>
									<td className="text-muted px-4 py-3">{categoryLabel ?? "-"}</td>
									<td className="text-ink px-4 py-3">
										{listing.budgetPublic
											? `${symbol} ${listing.totalBudget.toLocaleString()}`
											: t("budgetPrivate")}
									</td>
									<td className="text-ink px-4 py-3">
										{t("quoteCount", { count: listing.quoteCount })}
									</td>
									<td
										className={cn(
											"px-4 py-3",
											remaining.isUrgent ? "font-medium text-[#DC2626]" : "text-muted",
										)}>
										{remainingText}
									</td>
									<td className="text-subtle px-4 py-3">{formatDate(listing.createdAt)}</td>
									<td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
										{listing.bookmarkCount > 0 && (
											<button
												type="button"
												onClick={() => onOpenBookmarks(listing.id)}
												className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-100">
												<Star size={11} fill="currentColor" />
												{listing.bookmarkCount}
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
