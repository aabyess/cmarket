"use client";

import { cva } from "class-variance-authority";
import { Building2, MessageSquare } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import type { MyQuote, QuoteStatus } from "@/features/seller/types";

type MyQuotesTableProps = {
	quotes: MyQuote[];
	onViewListing: (listingId: string) => void;
	onGoToChat: (quoteId: string) => void;
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
	pending: "검토 중",
	awarded: "계약 확정",
	rejected: "미선정",
};

const statusChip = cva("rounded-full px-2 py-0.5 text-xs font-semibold", {
	variants: {
		status: {
			pending: "bg-[#EFF6FF] text-imsg-blue",
			awarded: "bg-[#F0FDF4] text-[#16A34A]",
			rejected: "bg-[#F3F4F6] text-[#6B7280]",
		},
	},
	defaultVariants: { status: "pending" },
});

export function MyQuotesTable({
	quotes,
	onViewListing,
	onGoToChat,
}: MyQuotesTableProps): React.JSX.Element {
	return (
		<div className="overflow-hidden rounded-2xl bg-white shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead className="bg-[#FAFAFC]">
						<tr className="text-xs text-imsg-secondary">
							<th className="whitespace-nowrap px-4 py-3 font-medium">상태</th>
							<th className="px-4 py-3 font-medium">견적요청</th>
							<th className="px-4 py-3 font-medium">발주기업</th>
							<th className="whitespace-nowrap px-4 py-3 text-right font-medium">내 견적가</th>
							<th className="whitespace-nowrap px-4 py-3 text-right font-medium">납품</th>
							<th className="whitespace-nowrap px-4 py-3 text-right font-medium">제출일</th>
							<th className="px-4 py-3" />
						</tr>
					</thead>
					<tbody>
						{quotes.map((quote) => (
							<tr key={quote.id} className="border-t border-[#F2F2F7] hover:bg-imsg-surface">
								<td className="whitespace-nowrap px-4 py-3">
									<span className={statusChip({ status: quote.status })}>
										{STATUS_LABELS[quote.status]}
									</span>
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
									<span className="flex items-center gap-1.5 text-imsg-secondary">
										<Building2 size={13} className="shrink-0" />
										<span className="max-w-[14rem] truncate">{quote.buyerCompanyName}</span>
									</span>
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-[#0f172a]">
									{CURRENCY_SYMBOL[quote.currency]} {quote.price.toLocaleString()}
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-right text-[#374151]">
									{quote.deliveryDays}일
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-right text-imsg-secondary">
									{new Date(quote.createdAt).toLocaleDateString("ko-KR")}
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-right">
									{quote.status === "awarded" && (
										<button
											type="button"
											onClick={() => onGoToChat(quote.id)}
											className="inline-flex items-center gap-1 rounded-lg bg-imsg-blue px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-blue-600">
											<MessageSquare size={12} />
											대화하기
										</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
