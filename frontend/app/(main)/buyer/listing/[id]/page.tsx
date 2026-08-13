import { notFound } from "next/navigation";
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

	if (!listing) notFound();

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<ListingDetail listing={listing} quoteCount={quotes.length} />

			<div className="mb-4 mt-8">
				<h2 className="text-lg font-semibold text-[#0f172a]">받은 견적</h2>
				<p className="mt-1 text-sm text-imsg-secondary">
					{quotes.length > 0
						? `견적 ${quotes.length}건 · 가격 낮은 순`
						: "아직 받은 견적이 없어요"}
				</p>
			</div>

			<QuoteReview quotes={quotes} backHref={`/buyer/listing/${id}`} />
		</div>
	);
}
