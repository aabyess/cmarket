import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ListingDetail } from "@/features/buyer/components/ListingDetail";
import { QuoteReview } from "@/features/buyer/components/QuoteReview";
import { getListingDetail, getQuotesByListing } from "@/features/buyer/apis";

type ListingDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({
	params,
}: ListingDetailPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const [listing, quotes] = await Promise.all([getListingDetail(id), getQuotesByListing(id)]);
	const t = await getTranslations("BuyerListingPage");

	if (!listing) notFound();

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<ListingDetail listing={listing} quoteCount={quotes.length} />

			<div className="mb-4 mt-8">
				<h2 className="text-lg font-semibold text-[#0f172a]">{t("title")}</h2>
				<p className="mt-1 text-sm text-imsg-secondary">
					{quotes.length > 0 ? t("quoteCount", { count: quotes.length }) : t("emptyQuotes")}
				</p>
			</div>

			<QuoteReview quotes={quotes} listingItems={listing.items} backHref={`/buyer/listing/${id}`} />
		</div>
	);
}
