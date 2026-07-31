"use client";

import type { BuyerSavings } from "@/features/buyer/types";

type DashboardHomeSavingsCardProps = {
	savings: BuyerSavings;
};

function formatCompactIdr(amount: number): string {
	const juta = Math.round(amount / 1_000_000);
	return `Rp ${juta.toLocaleString("id-ID")}jt`;
}

export function DashboardHomeSavingsCard({ savings }: DashboardHomeSavingsCardProps) {
	return (
		<div className="rounded-2xl bg-[#ECFDF5] p-4">
			<p className="text-xs text-[#059669]">아낀 총 금액</p>
			<p className="mt-0.5 text-[22px] font-medium tracking-tight text-[#047857]">
				{formatCompactIdr(savings.totalAmount)}
			</p>
			<p className="mt-0.5 text-[11px] text-[#059669]/75">
				완료 거래 {savings.completedCount}건
			</p>
		</div>
	);
}