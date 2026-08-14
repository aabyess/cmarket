import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { OrderList } from "@/features/buyer/components/OrderList";
import { getBuyerListings } from "@/features/buyer/apis";

export default async function OrderListPage() {
	const [listings, t] = await Promise.all([getBuyerListings(), getTranslations("BuyerOrderListPage")]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-5 flex items-end justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
					<p className="mt-1 text-sm text-[#6B7280]">
						{t("count", { count: listings.length })}
					</p>
				</div>
				<Link
					href="/buyer/post-listing"
					className="flex items-center gap-1.5 rounded-lg bg-imsg-blue px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#2563EB]"
				>
					<Plus size={15} />
					{t("newListing")}
				</Link>
			</div>

			<OrderList listings={listings} />
		</div>
	);
}