import { ListingBrowse } from "@/features/seller/components/ListingBrowse";
import { getOpenListings } from "@/features/seller/serverApis";

export default async function ListingBrowsePage() {
	const listings = await getOpenListings();

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-5">
				<h1 className="text-2xl font-bold text-[#1F2937]">공고 탐색</h1>
				<p className="mt-1 text-sm text-[#6B7280]">
					지금 견적을 받고 있는 공고 {listings.length}건
				</p>
			</div>

			<ListingBrowse listings={listings} />
		</div>
	);
}