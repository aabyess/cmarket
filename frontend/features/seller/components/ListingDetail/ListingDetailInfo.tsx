"use client";

import { Clock, MapPin, Building2, Truck } from "lucide-react";
import type { Currency } from "@/features/buyer/types";
import type { ListingDetail } from "@/features/seller/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemainingText(endDate: string): string {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return "마감됨";
	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return `마감 D-${days}`;
}

type ListingDetailInfoProps = {
	listing: ListingDetail;
};

export function ListingDetailInfo({ listing }: ListingDetailInfoProps) {
	const symbol = CURRENCY_SYMBOL[listing.currency];
	const location = [listing.deliveryCity, listing.deliveryProvinsi].filter(Boolean).join(", ");

	return (
		<div className="space-y-4">
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
				<div className="mb-2 flex items-center gap-2">
					<span className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#3B82F6]">
						<Clock size={12} />
						{getRemainingText(listing.endDate)}
					</span>
				</div>

				<h2 className="text-xl font-bold text-[#1F2937]">{listing.title}</h2>

				<p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#6B7280]">
					<Building2 size={14} />
					{listing.companyName}
				</p>

				{listing.description && (
					<p className="mt-3 whitespace-pre-wrap border-t border-[#F3F4F6] pt-3 text-sm leading-relaxed text-[#374151]">
						{listing.description}
					</p>
				)}
			</div>

			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
				<p className="mb-3 text-sm font-semibold text-[#1F2937]">요청 품목</p>

				<div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
					<table className="w-full text-sm">
						<thead className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
							<tr>
								<th className="w-10 px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
									No.
								</th>
								<th className="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
									품명
								</th>
								<th className="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
									규격
								</th>
								<th className="w-24 px-3 py-2.5 text-right text-xs font-medium text-[#6B7280]">
									수량
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[#F3F4F6]">
							{listing.items.map((item, index) => (
								<tr key={item.id}>
									<td className="px-3 py-3 text-[#9CA3AF]">{index + 1}</td>
									<td className="px-3 py-3 text-[#1F2937]">{item.name}</td>
									<td className="px-3 py-3 text-[#6B7280]">{item.spec || "-"}</td>
									<td className="px-3 py-3 text-right text-[#1F2937]">
										{item.quantity.toLocaleString()} {item.unit}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
				<p className="mb-3 text-sm font-semibold text-[#1F2937]">거래 조건</p>

				<div className="space-y-3 text-sm">
					<div className="flex justify-between border-b border-[#F3F4F6] pb-3">
						<span className="text-[#6B7280]">예산</span>
						<span className="font-medium text-[#1F2937]">
							{listing.budgetPublic
								? `${symbol} ${listing.totalBudget.toLocaleString()}`
								: "비공개"}
						</span>
					</div>

					<div className="flex justify-between border-b border-[#F3F4F6] pb-3">
						<span className="flex items-center gap-1.5 text-[#6B7280]">
							<Truck size={14} />
							희망 납품 기한
						</span>
						<span className="font-medium text-[#1F2937]">
							{listing.deliveryDays > 0 ? `${listing.deliveryDays}일 이내` : "협의"}
						</span>
					</div>

					<div className="flex justify-between gap-4">
						<span className="flex shrink-0 items-center gap-1.5 text-[#6B7280]">
							<MapPin size={14} />
							배송지
						</span>
						<span className="text-right font-medium text-[#1F2937]">
							{location}
							{listing.deliveryAddress && (
								<span className="block text-xs font-normal text-[#6B7280]">
									{listing.deliveryAddress}
								</span>
							)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}