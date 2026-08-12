import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import type { ListingDetailData } from "@/features/buyer/components/ListingDetail/types";

type ListingDetailSummaryProps = {
	listing: ListingDetailData;
	quoteCount: number;
};

type SummaryCell = {
	label: string;
	value: string;
	sub: string | null;
	accent: boolean;
};

/** 오늘 자정 기준으로 남은 일수. 시각 차이로 하루가 어긋나지 않게 날짜만 비교한다. */
function daysUntil(endDate: string): number {
	const end = new Date(endDate);
	const today = new Date();
	const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
	const todayDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
	return Math.round((endDay - todayDay) / 86_400_000);
}

function buildCells(listing: ListingDetailData, quoteCount: number): SummaryCell[] {
	const symbol = CURRENCY_SYMBOL[listing.currency] ?? "";
	const remaining = daysUntil(listing.endDate);
	const totalQuantity = listing.items.reduce((sum, item) => sum + item.quantity, 0);
	const units = new Set(listing.items.map((item) => item.unit));

	return [
		{
			label: "예산",
			value: listing.budgetPublic ? `${symbol} ${listing.totalBudget.toLocaleString()}` : "비공개",
			sub: listing.budgetPublic ? listing.currency : "공급기업에게 보이지 않아요",
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
		{
			label: "받은 견적",
			value: `${quoteCount}건`,
			sub: quoteCount > 0 ? "가격 낮은 순" : "아직 없어요",
			accent: quoteCount > 0,
		},
	];
}

export function ListingDetailSummary({
	listing,
	quoteCount,
}: ListingDetailSummaryProps): React.JSX.Element {
	const cells = buildCells(listing, quoteCount);

	return (
		<div className="rounded-2xl bg-white p-6 shadow-sm">
			<div className="grid grid-cols-1 divide-y divide-[#F2F2F7] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
				{cells.map((cell) => (
					<div
						key={cell.label}
						className="px-0 py-4 first:pt-0 last:pb-0 sm:py-0 lg:px-6 lg:first:pl-0 lg:last:pr-0">
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
		</div>
	);
}
