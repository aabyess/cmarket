import { Building2, FileText } from "lucide-react";
import { cva } from "class-variance-authority";
import { ListingInfo } from "@/features/shared/components/ListingInfo";
import { CATEGORY_LABELS, CURRENCY_SYMBOL } from "@/features/buyer/constants";
import type { ListingDetail } from "@/features/seller/types";

type ListingDetailInfoProps = {
	listing: ListingDetail;
};

const statusChip = cva("rounded-full px-2.5 py-1 text-xs font-semibold", {
	variants: {
		state: {
			open: "bg-[#EFF6FF] text-imsg-blue",
			closing: "bg-[#FFFBEB] text-[#D97706]",
			closed: "bg-[#F3F4F6] text-[#6B7280]",
		},
	},
	defaultVariants: { state: "open" },
});

function daysUntil(endDate: string): number {
	const end = new Date(endDate);
	const today = new Date();
	return Math.round(
		(Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) -
			Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
			86_400_000,
	);
}

export function ListingDetailInfo({ listing }: ListingDetailInfoProps): React.JSX.Element {
	const symbol = CURRENCY_SYMBOL[listing.currency] ?? "";
	const remaining = daysUntil(listing.endDate);
	const totalQuantity = listing.items.reduce((sum, item) => sum + item.quantity, 0);
	const units = new Set(listing.items.map((item) => item.unit));

	const summary = [
		{
			label: "예산",
			value: listing.budgetPublic ? `${symbol} ${listing.totalBudget.toLocaleString()}` : "비공개",
			sub:
				listing.budgetPublic && listing.budgetInKrw !== null && listing.currency !== "KRW"
					? `약 ₩ ${Math.round(listing.budgetInKrw).toLocaleString()}`
					: listing.budgetPublic
						? listing.currency
						: "발주기업이 공개하지 않았어요",
			accent: false,
		},
		{
			label: "견적 마감",
			value: new Date(listing.endDate).toLocaleDateString("ko-KR"),
			sub: remaining > 0 ? `${remaining}일 남음` : remaining === 0 ? "오늘 마감" : "마감됨",
			accent: remaining >= 0 && remaining <= 3,
		},
		{
			label: "요청 품목",
			value: `${listing.items.length}종`,
			sub: units.size === 1 ? `총 ${totalQuantity.toLocaleString()} ${[...units][0]}` : null,
			accent: false,
		},
	];

	return (
		<div className="space-y-5">
			<section className="rounded-2xl bg-white p-6 shadow-sm">
				<div className="mb-2 flex flex-wrap items-center gap-2">
					<span
						className={statusChip({
							state: remaining < 0 ? "closed" : remaining <= 3 ? "closing" : "open",
						})}>
						{remaining < 0 ? "마감됨" : remaining === 0 ? "오늘 마감" : `${remaining}일 남음`}
					</span>
					<span className="rounded-full bg-imsg-surface px-2.5 py-1 text-xs font-medium text-imsg-secondary">
						{CATEGORY_LABELS[listing.category]}
					</span>
					<span className="text-xs text-imsg-secondary">
						{new Date(listing.createdAt).toLocaleDateString("ko-KR")} 등록
					</span>
				</div>

				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{listing.title}</h1>
				<p className="mt-1.5 flex items-center gap-1.5 text-sm text-imsg-secondary">
					<Building2 size={14} />
					{listing.companyName || "발주기업"}
				</p>

				<div className="mt-5 grid grid-cols-1 divide-y divide-[#F2F2F7] border-t border-[#F2F2F7] pt-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
					{summary.map((cell) => (
						<div key={cell.label} className="py-3 first:pt-0 last:pb-0 sm:px-5 sm:py-0 sm:first:pl-0">
							<p className="text-sm font-medium text-imsg-secondary">{cell.label}</p>
							<p
								className={
									cell.accent
										? "mt-1 text-2xl font-bold tracking-tight text-imsg-blue"
										: "mt-1 text-2xl font-bold tracking-tight text-[#0f172a]"
								}>
								{cell.value}
							</p>
							{cell.sub && <p className="mt-0.5 text-sm text-imsg-secondary">{cell.sub}</p>}
						</div>
					))}
				</div>
			</section>

			{listing.description && (
				<section className="rounded-2xl bg-white p-6 shadow-sm">
					<h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#0f172a]">
						<FileText size={16} className="text-imsg-secondary" />
						상세 설명
					</h2>
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
					// 계약 확정 전에는 발주기업 담당자 연락처를 제공하지 않는다.
					contact: null,
				}}
			/>
		</div>
	);
}
