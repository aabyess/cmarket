import { MyQuotes } from "@/features/seller/components/MyQuotes";
import { getMyQuotes } from "@/features/seller/serverApis";

export default async function MyQuotesPage() {
	const quotes = await getMyQuotes();

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-5">
				<h1 className="text-2xl font-bold text-[#1F2937]">보낸 견적</h1>
				<p className="mt-1 text-sm text-[#6B7280]">제출한 견적 {quotes.length}건</p>
			</div>

			<MyQuotes quotes={quotes} />
		</div>
	);
}