import { Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { OrderList } from "@/features/buyer/components/OrderList";
import { getBuyerListings } from "@/features/buyer/apis";

export default async function OrderListPage() {
	const listings = await getBuyerListings();

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-5 flex items-end justify-between">
				<div>
					<h1 className="text-2xl font-bold text-[#1F2937]">내 공고</h1>
					<p className="mt-1 text-sm text-[#6B7280]">
						등록한 공고 {listings.length}건
					</p>
				</div>
				<Link
					href="/buyer/post-listing"
					className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#2563EB]"
				>
					<Plus size={15} />
					새 견적 등록
				</Link>
			</div>

			<OrderList listings={listings} />
		</div>
	);
}