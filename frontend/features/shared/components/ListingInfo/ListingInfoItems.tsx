import Decimal from "decimal.js";
import { Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import type { Currency, ListingItem } from "@/features/buyer/types";

type ListingInfoItemsProps = {
	items: ListingItem[];
	currency: Currency;
};

function getItemAmount(item: ListingItem): Decimal {
	return new Decimal(item.price).times(item.quantity);
}

export async function ListingInfoItems({
	items,
	currency,
}: ListingInfoItemsProps): Promise<React.JSX.Element> {
	const t = await getTranslations("ListingInfoItems");
	const symbol = CURRENCY_SYMBOL[currency] ?? "";
	const hasPrice = items.some((item) => item.price > 0);
	const total = items
		.reduce((sum, item) => sum.plus(getItemAmount(item)), new Decimal(0))
		.toNumber();

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			<h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#0f172a]">
				<Package size={16} className="text-imsg-secondary" />
				{t("heading")}
				<span className="rounded-full bg-imsg-surface px-2 py-0.5 text-xs font-medium text-imsg-secondary">
					{t("itemCount", { count: items.length })}
				</span>
			</h2>

			{items.length === 0 ? (
				<p className="py-6 text-center text-sm text-imsg-secondary">{t("empty")}</p>
			) : (
				<div className="overflow-hidden rounded-xl border border-[#F2F2F7]">
					<table className="w-full text-left text-sm">
						<thead className="bg-[#FAFAFC]">
							<tr className="text-xs text-imsg-secondary">
								<th className="px-4 py-2.5 font-medium">{t("columnName")}</th>
								<th className="px-4 py-2.5 font-medium">{t("columnSpec")}</th>
								<th className="px-4 py-2.5 text-right font-medium">{t("columnQuantity")}</th>
								{hasPrice && (
									<th className="px-4 py-2.5 text-right font-medium">{t("columnUnitPrice")}</th>
								)}
								{hasPrice && (
									<th className="px-4 py-2.5 text-right font-medium">{t("columnAmount")}</th>
								)}
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
												? `${symbol} ${getItemAmount(item).toNumber().toLocaleString()}`
												: "-"}
										</td>
									)}
								</tr>
							))}
						</tbody>
						{hasPrice && (
							<tfoot>
								<tr className="border-t border-[#F2F2F7] bg-[#FAFAFC]">
									<td className="px-4 py-3 text-xs text-imsg-secondary" colSpan={4}>
										{t("itemsTotal")}
									</td>
									<td className="whitespace-nowrap px-4 py-3 text-right font-bold text-[#0f172a]">
										{symbol} {total.toLocaleString()}
									</td>
								</tr>
							</tfoot>
						)}
					</table>
				</div>
			)}
		</section>
	);
}
