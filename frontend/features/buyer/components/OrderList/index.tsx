"use client";

import { useRouter } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { OrderListCard } from "@/features/buyer/components/OrderList/OrderListCard";
import type { ListingSummary } from "@/features/buyer/types";

type OrderListProps = {
	listings: ListingSummary[];
};

export function OrderList({ listings }: OrderListProps) {
	const router = useRouter();

	if (listings.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<FileText size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-[17px] font-medium text-[#1F2937]">등록한 공고가 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">
					첫 공고를 올리면 한국 공급기업들이 견적을 보내드려요.
				</p>
				<button
					onClick={() => router.push("/buyer/post-listing")}
					className="mt-5 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
				>
					첫 공고 올리기
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{listings.map((listing) => (
				<OrderListCard
					key={listing.id}
					listing={listing}
					onClick={() => router.push(`/buyer/quote-review?listingId=${listing.id}`)}
				/>
			))}
		</div>
	);
}