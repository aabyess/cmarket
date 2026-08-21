// features/seller/components/ListingBrowse/ListingBrowseTable.tsx
"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency } from "@/features/buyer/types";
import type { OpenListing } from "@/features/seller/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemaining(
	endDate: string,
	status: OpenListing["status"],
): { days: number; isUrgent: boolean; isClosed: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	const isClosed = status !== "active" || diff <= 0;

	if (isClosed) return { days: 0, isUrgent: false, isClosed: true };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { days, isUrgent: days <= 3, isClosed: false };
}

type ListingBrowseTableProps = {
	listings: OpenListing[];
	onRowClick: (id: string) => void;
};

export function ListingBrowseTable({ listings, onRowClick }: ListingBrowseTableProps): React.ReactNode {
	const t = useTranslations("ListingBrowseTable");
	const locale = useLocale();

	return (
		<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-medium text-[#9CA3AF]">
						<th className="px-4 py-3">{t("columnStatus")}</th>
						<th className="px-4 py-3">{t("columnTitle")}</th>
						<th className="px-4 py-3">{t("columnRegisteredAt")}</th>
						<th className="px-4 py-3">{t("columnBudget")}</th>
						<th className="px-4 py-3">{t("columnDelivery")}</th>
						<th className="px-4 py-3">{t("columnMyQuote")}</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-[#F3F4F6]">
					{listings.map((listing) => {
						const remaining = getRemaining(listing.endDate, listing.status);
						const symbol = CURRENCY_SYMBOL[listing.currency];
						const location = [listing.deliveryCity, listing.deliveryProvinsi]
							.filter(Boolean)
							.join(", ");

						return (
							<tr
								key={listing.id}
								onClick={() => onRowClick(listing.id)}
								className="cursor-pointer transition-colors hover:bg-[#F9FAFB]"
							>
								<td className="px-4 py-3">
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
										{remaining.isClosed ? t("closed") : t("daysLeft", { days: remaining.days })}
									</span>
								</td>
								<td className="max-w-[320px] truncate px-4 py-3 font-medium text-[#1F2937]">
									{listing.title}
								</td>
								<td className="px-4 py-3 whitespace-nowrap text-[#6B7280]">
									{new Date(listing.createdAt).toLocaleDateString(locale)}
								</td>
								<td className="px-4 py-3 text-[#1F2937]">
									{listing.budgetPublic
										? `${symbol} ${listing.totalBudget.toLocaleString()}`
										: t("budgetPrivate")}
								</td>
								<td className="px-4 py-3 text-[#1F2937]">{location || "-"}</td>
								<td className="px-4 py-3">
									{listing.hasMyQuote ? (
										<span className="flex w-fit items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-medium text-[#059669]">
											<CheckCircle2 size={11} />
											{t("quoteSent")}
										</span>
									) : (
										<span className="text-xs text-[#9CA3AF]">{t("noQuote")}</span>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
