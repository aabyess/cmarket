import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ListingDetailInfo } from "@/features/seller/components/ListingDetail/ListingDetailInfo";
import { ListingDetailQuoteForm } from "@/features/seller/components/ListingDetail/ListingDetailQuoteForm";
import { getListingDetail } from "@/features/seller/serverApis";

type ListingDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
	const { id } = await params;
	const listing = await getListingDetail(id);

	if (!listing) notFound();

	return (
		<div className="px-8 py-6 xl:px-12">
			<Link
				href="/seller/listing-browse"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
			>
				<ChevronLeft size={16} />
				공고 목록으로
			</Link>

			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
				<ListingDetailInfo listing={listing} />
				<ListingDetailQuoteForm
					listingId={listing.id}
					defaultCurrency={listing.currency}
					myQuote={listing.myQuote}
					isClosed={new Date(listing.endDate).getTime() <= Date.now()}
				/>
			</div>
		</div>
	);
}