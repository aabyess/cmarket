import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { ListingDetailInfo } from "@/features/seller/components/ListingDetail/ListingDetailInfo";
import { ListingDetailQuoteForm } from "@/features/seller/components/ListingDetail/ListingDetailQuoteForm";
import { getListingDetail } from "@/features/seller/serverApis";

type ListingDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
	const { id } = await params;
	const [listing, t] = await Promise.all([
		getListingDetail(id),
		getTranslations("SellerListingDetailPage"),
	]);

	if (!listing) notFound();

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/seller/listing-browse"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]"
			>
				<ChevronLeft size={16} />
				{t("backToList")}
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