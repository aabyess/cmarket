import { getTranslations } from "next-intl/server";
import { ListingBrowse } from "@/features/seller/components/ListingBrowse";
import { getOpenListings } from "@/features/seller/serverApis";

export default async function ListingBrowsePage() {
	const [listings, t] = await Promise.all([
		getOpenListings(),
		getTranslations("SellerListingBrowsePage"),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-5">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">
					{t("subtitle", { count: listings.length })}
				</p>
			</div>

			<ListingBrowse listings={listings} />
		</div>
	);
}