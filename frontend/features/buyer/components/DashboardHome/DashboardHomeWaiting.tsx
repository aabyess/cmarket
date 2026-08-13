"use client";

import { Clock } from "lucide-react";

type DashboardHomeWaitingProps = {
	listingCount: number;
	onViewListings: () => void;
};

export function DashboardHomeWaiting({ listingCount, onViewListings }: DashboardHomeWaitingProps) {
	return (
		<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center">
			<div className="mx-auto mb-3.5 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
				<Clock size={28} className="text-[#9CA3AF]" />
			</div>

			<p className="text-base font-medium text-[#1F2937]">지금은 할 일이 없어요</p>
			<p className="mt-1 text-sm leading-relaxed text-[#6B7280]">
				공고 {listingCount}건이 진행 중이에요.
				<br />
				견적이 도착하면 여기에서 알려드릴게요.
			</p>

			<button
				onClick={onViewListings}
				className="mt-4 w-full rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50"
			>
				진행 중인 공고 보기
			</button>
		</div>
	);
}