import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { QuoteReview } from "@/features/buyer/components/QuoteReview";
import { QuoteReviewListingPicker } from "@/features/buyer/components/QuoteReview/QuoteReviewListingPicker";
import { getListingDetail, getListingsWithQuoteCount, getListingTitle, getQuotesByListing } from "@/features/buyer/apis";

type QuoteReviewPageProps = {
	searchParams: Promise<{ listingId?: string }>;
};

export default async function QuoteReviewPage({ searchParams }: QuoteReviewPageProps) {
	const { listingId } = await searchParams;
	const t = await getTranslations("BuyerQuoteReviewPage");

	if (!listingId) {
		const listings = await getListingsWithQuoteCount();

		return (
			<div className="px-8 py-6 xl:px-12">
				<div className="mb-5">
					<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
					<p className="mt-1 text-sm text-[#6B7280]">{t("subtitle")}</p>
				</div>

				<QuoteReviewListingPicker listings={listings} />
			</div>
		);
	}

	// 제목 하나 때문에 전체 공고+견적을 내려받지 않도록 경량 조회를 쓴다.
	const [listingTitle, quotes, listingDetail] = await Promise.all([
		getListingTitle(listingId),
		getQuotesByListing(listingId),
		getListingDetail(listingId),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<Link
				href="/buyer/quote-review"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
			>
				<ChevronLeft size={16} />
				{t("backToList")}
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold text-[#1F2937]">
					{listingTitle ?? t("title")}
				</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("quoteCount", { count: quotes.length })}</p>
			</div>

			<QuoteReview
				quotes={quotes}
				listingItems={listingDetail?.items ?? []}
				backHref={`/buyer/quote-review?listingId=${listingId}`}
			/>
		</div>
	);
}