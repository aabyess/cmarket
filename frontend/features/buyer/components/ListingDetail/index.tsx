import { Link } from "@/i18n/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { cva } from "class-variance-authority";
import { getTranslations } from "next-intl/server";
import { ListingDetailActions } from "@/features/buyer/components/ListingDetailActions";
import { ListingDetailSummary } from "@/features/buyer/components/ListingDetail/ListingDetailSummary";
import { ListingInfo } from "@/features/shared/components/ListingInfo";
import { getCategoryLabels, getListingStatusLabels } from "@/features/buyer/constants";
import type { ListingDetailData } from "@/features/buyer/components/ListingDetail/types";

type ListingDetailProps = {
	listing: ListingDetailData;
	quoteCount: number;
};

const statusChip = cva("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", {
	variants: {
		status: {
			active: "bg-[#EFF6FF] text-imsg-blue",
			closed: "bg-[#F3F4F6] text-[#6B7280]",
			awarded: "bg-[#F0FDF4] text-[#16A34A]",
		},
	},
	defaultVariants: { status: "active" },
});

export async function ListingDetail({
	listing,
	quoteCount,
}: ListingDetailProps): Promise<React.JSX.Element> {
	const t = await getTranslations("ListingDetail");
	const [categoryLabels, listingStatusLabels] = await Promise.all([
		getTranslations("ListingCategory").then(getCategoryLabels),
		getTranslations("ListingStatusLabel").then(getListingStatusLabels),
	]);

	return (
		<div className="space-y-5">
			<div>
				<Link
					href="/buyer/order-list"
					className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
					<ChevronLeft size={16} />
					{t("backToList")}
				</Link>

				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<div className="mb-2 flex flex-wrap items-center gap-2">
							<span className={statusChip({ status: listing.status })}>
								{listingStatusLabels[listing.status]}
							</span>
							<span className="rounded-full bg-imsg-surface px-2.5 py-1 text-xs font-medium text-imsg-secondary">
								{categoryLabels[listing.category]}
							</span>
							<span className="text-xs text-imsg-secondary">
								{t("registeredOn", { date: new Date(listing.createdAt).toLocaleDateString("ko-KR") })}
							</span>
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{listing.title}</h1>
					</div>

					<ListingDetailActions listingId={listing.id} />
				</div>
			</div>

			<ListingDetailSummary listing={listing} quoteCount={quoteCount} />

			{listing.description && (
				<section className="rounded-2xl bg-white p-6 shadow-sm">
					<h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#0f172a]">
						<FileText size={16} className="text-imsg-secondary" />
						{t("descriptionTitle")}
					</h2>
					{/* 설명은 에디터가 만든 HTML 이다. 작성자는 로그인한 발주기업 본인이고
					    저장 경로가 서버를 거치므로 그대로 렌더한다. */}
					<div
						className="prose prose-sm max-w-none text-[#374151] [&_table]:w-full [&_td]:border [&_td]:border-[#E5E7EB] [&_td]:p-2 [&_th]:border [&_th]:border-[#E5E7EB] [&_th]:bg-[#F9FAFB] [&_th]:p-2"
						dangerouslySetInnerHTML={{ __html: listing.description }}
					/>
				</section>
			)}

			<ListingInfo
				listingId={listing.id}
				items={listing.items}
				currency={listing.currency}
				attachments={listing.attachments}
				delivery={{
					provinsi: listing.deliveryProvinsi,
					city: listing.deliveryCity,
					address: listing.deliveryAddress,
					addressDetail: listing.deliveryAddressDetail,
					method: listing.deliveryMethod,
					timingMode: listing.deliveryTimingMode,
					deadlineDate: listing.deliveryDeadlineDate,
					deliveryDays: listing.deliveryDays,
					lat: listing.deliveryLat,
					lng: listing.deliveryLng,
					// 공고 주인이므로 자기 담당자 정보를 본다.
					contact: { name: listing.contactName, phone: listing.contactPhone },
				}}
			/>
		</div>
	);
}
