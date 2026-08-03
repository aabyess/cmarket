"use client";

import { useRouter } from "next/navigation";
import { Mail, ChevronRight } from "lucide-react";
import type { ListingWithQuotes } from "@/features/buyer/types";

type QuoteReviewListingPickerProps = {
	listings: ListingWithQuotes[];
};

export function QuoteReviewListingPicker({ listings }: QuoteReviewListingPickerProps) {
	const router = useRouter();

	if (listings.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Mail size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-[17px] font-medium text-[#1F2937]">등록한 공고가 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">
					공고를 올리면 공급기업들이 견적을 보내드려요.
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
				<button
					key={listing.id}
					onClick={() => router.push(`/buyer/quote-review?listingId=${listing.id}`)}
					className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 text-left transition-colors hover:bg-[#F9FAFB]"
				>
					<div className="min-w-0">
						<p className="truncate text-[15px] font-medium text-[#1F2937]">{listing.title}</p>
						<p className="mt-1 text-[13px] text-[#6B7280]">
							{listing.quoteCount > 0
								? `견적 ${listing.quoteCount}건 도착`
								: "아직 견적이 없어요"}
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						{listing.quoteCount > 0 && (
							<span className="rounded-full bg-[#EF4444] px-2 py-0.5 text-xs font-medium text-white">
								{listing.quoteCount}
							</span>
						)}
						<ChevronRight size={18} className="text-[#D1D5DB]" />
					</div>
				</button>
			))}
		</div>
	);
}