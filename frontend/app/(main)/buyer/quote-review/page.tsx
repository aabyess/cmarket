import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { QuoteReview } from "@/features/buyer/components/QuoteReview";
import { QuoteReviewListingPicker } from "@/features/buyer/components/QuoteReview/QuoteReviewListingPicker";
import { getListingsWithQuoteCount, getQuotesByListing } from "@/features/buyer/apis";

type QuoteReviewPageProps = {
	searchParams: Promise<{ listingId?: string }>;
};

export default async function QuoteReviewPage({ searchParams }: QuoteReviewPageProps) {
	const { listingId } = await searchParams;

	if (!listingId) {
		const listings = await getListingsWithQuoteCount();

		return (
			<div className="px-8 py-6 xl:px-12">
				<div className="mb-5">
					<h1 className="text-2xl font-bold text-[#1F2937]">받은 견적</h1>
					<p className="mt-1 text-sm text-[#6B7280]">공고를 선택해 견적을 확인하세요</p>
				</div>

				<QuoteReviewListingPicker listings={listings} />
			</div>
		);
	}

	const [listings, quotes] = await Promise.all([
		getListingsWithQuoteCount(),
		getQuotesByListing(listingId),
	]);

	const currentListing = listings.find((listing) => listing.id === listingId);

	return (
		<div className="px-8 py-6 xl:px-12">
			<Link
				href="/buyer/quote-review"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
			>
				<ChevronLeft size={16} />
				공고 목록으로
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold text-[#1F2937]">
					{currentListing?.title ?? "받은 견적"}
				</h1>
				<p className="mt-1 text-sm text-[#6B7280]">견적 {quotes.length}건 · 가격 낮은 순</p>
			</div>

			<QuoteReview quotes={quotes} />
		</div>
	);
}