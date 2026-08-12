import { Package } from "lucide-react";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import type { Currency, ListingItem } from "@/features/buyer/types";

type ListingDetailItemsProps = {
	items: ListingItem[];
	currency: Currency;
};

export function ListingDetailItems({ items, currency }: ListingDetailItemsProps): React.JSX.Element {
	const symbol = CURRENCY_SYMBOL[currency] ?? "";
	const hasPrice = items.some((item) => item.price > 0);
	const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			<h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#0f172a]">
				<Package size={16} className="text-imsg-secondary" />
				요청 품목
				<span className="rounded-full bg-imsg-surface px-2 py-0.5 text-xs font-medium text-imsg-secondary">
					{items.length}종
				</span>
			</h2>

			<div className="overflow-hidden rounded-xl border border-[#F2F2F7]">
				<table className="w-full text-left text-sm">
					<thead className="bg-[#FAFAFC]">
						<tr className="text-xs text-imsg-secondary">
							<th className="px-4 py-2.5 font-medium">품목</th>
							<th className="px-4 py-2.5 font-medium">규격</th>
							<th className="px-4 py-2.5 text-right font-medium">수량</th>
							{hasPrice && <th className="px-4 py-2.5 text-right font-medium">희망 단가</th>}
							{hasPrice && <th className="px-4 py-2.5 text-right font-medium">금액</th>}
						</tr>
					</thead>
					<tbody>
						{items.map((item) => (
							<tr key={item.id} className="border-t border-[#F2F2F7]">
								<td className="px-4 py-3 font-medium text-[#0f172a]">{item.name}</td>
								<td className="px-4 py-3 text-imsg-secondary">{item.spec || "-"}</td>
								<td className="whitespace-nowrap px-4 py-3 text-right text-[#0f172a]">
									{item.quantity.toLocaleString()} {item.unit}
								</td>
								{hasPrice && (
									<td className="whitespace-nowrap px-4 py-3 text-right text-imsg-secondary">
										{item.price > 0 ? `${symbol} ${item.price.toLocaleString()}` : "-"}
									</td>
								)}
								{hasPrice && (
									<td className="whitespace-nowrap px-4 py-3 text-right font-medium text-[#0f172a]">
										{item.price > 0
											? `${symbol} ${(item.price * item.quantity).toLocaleString()}`
											: "-"}
									</td>
								)}
							</tr>
						))}
					</tbody>
					{hasPrice && (
						<tfoot>
							<tr className="border-t border-[#F2F2F7] bg-[#FAFAFC]">
								<td className="px-4 py-3 text-xs text-imsg-secondary" colSpan={hasPrice ? 4 : 3}>
									품목 합계
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-right font-bold text-[#0f172a]">
									{symbol} {total.toLocaleString()}
								</td>
							</tr>
						</tfoot>
					)}
				</table>
			</div>

			{items.length === 0 && (
				<p className="py-6 text-center text-sm text-imsg-secondary">등록된 품목이 없어요</p>
			)}
		</section>
	);
}
