import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Package } from "lucide-react";
import { QuoteReview } from "@/features/buyer/components/QuoteReview";
import { ListingDetailActions } from "@/features/buyer/components/ListingDetailActions";
import { getListingDetail, getQuotesByListing } from "@/features/buyer/apis";

const CATEGORY_LABEL: Record<string, string> = {
	office: "사무용품",
	lab: "연구장비",
	machinery: "산업기계",
	chemical: "화학약품",
};

const STATUS_LABEL: Record<string, string> = {
	active: "진행 중",
	closed: "마감",
	awarded: "계약 확정",
};

const CURRENCY_SYMBOL: Record<string, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

type ListingDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
	const { id } = await params;

	const [listing, quotes] = await Promise.all([getListingDetail(id), getQuotesByListing(id)]);

	if (!listing) notFound();

	const symbol = CURRENCY_SYMBOL[listing.currency] ?? "";

	return (
		<div className="px-8 py-6 xl:px-12">
			<Link
				href="/buyer/order-list"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
			>
				<ChevronLeft size={16} />
				나의 견적으로
			</Link>

			<div className="mb-5 flex items-start justify-between gap-4">
				<div>
					<div className="mb-2 flex items-center gap-2">
						<span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-[#3B82F6]">
							{STATUS_LABEL[listing.status] ?? listing.status}
						</span>
						<span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
							{CATEGORY_LABEL[listing.category] ?? listing.category}
						</span>
					</div>
					<h1 className="text-2xl font-bold text-[#1F2937]">{listing.title}</h1>
				</div>

				<ListingDetailActions listingId={listing.id} />
			</div>

			<div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white p-6">
				{listing.description && (
					<p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
						{listing.description}
					</p>
				)}

				<div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#F3F4F6] pt-4 sm:grid-cols-4">
					<div>
						<p className="text-xs text-[#9CA3AF]">예산</p>
						<p className="text-sm font-semibold text-[#1F2937]">
							{listing.budgetPublic ? `${symbol} ${listing.totalBudget.toLocaleString()}` : "비공개"}
						</p>
					</div>
					<div>
						<p className="text-xs text-[#9CA3AF]">마감일</p>
						<p className="text-sm font-semibold text-[#1F2937]">
							{new Date(listing.endDate).toLocaleDateString("ko-KR")}
						</p>
					</div>
					<div>
						<p className="text-xs text-[#9CA3AF]">희망 납품 기간</p>
						<p className="text-sm font-semibold text-[#1F2937]">{listing.deliveryDays}일</p>
					</div>
					<div>
						<p className="text-xs text-[#9CA3AF]">받은 견적</p>
						<p className="text-sm font-semibold text-[#1F2937]">{quotes.length}건</p>
					</div>
				</div>

				<div className="mt-4 flex items-start gap-1.5 border-t border-[#F3F4F6] pt-4 text-xs text-[#6B7280]">
					<MapPin size={14} className="mt-0.5 shrink-0" />
					{listing.deliveryProvinsi} {listing.deliveryCity} {listing.deliveryAddress}
				</div>

				<div className="mt-4 border-t border-[#F3F4F6] pt-4">
					<p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#9CA3AF]">
						<Package size={13} />
						품목
					</p>
					<div className="space-y-1.5">
						{listing.items.map((item) => (
							<div key={item.id} className="flex items-center justify-between text-xs">
								<span className="text-[#374151]">
									{item.name} {item.spec && `· ${item.spec}`}
								</span>
								<span className="text-[#9CA3AF]">
									{item.quantity} {item.unit}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="mb-5">
				<h2 className="text-lg font-semibold text-[#1F2937]">받은 견적</h2>
				<p className="mt-1 text-sm text-[#6B7280]">
					{quotes.length > 0 ? `견적 ${quotes.length}건 · 가격 낮은 순` : "아직 받은 견적이 없어요"}
				</p>
			</div>

			{quotes.length > 0 && <QuoteReview quotes={quotes} />}
		</div>
	);
}