"use client";

import { Mail } from "lucide-react";
import { QuoteCompareTable } from "@/features/buyer/components/QuoteReview/QuoteCompareTable";
import type { ReceivedQuote } from "@/features/buyer/types";

type QuoteReviewProps = {
	quotes: ReceivedQuote[];
};

export function QuoteReview({ quotes }: QuoteReviewProps) {
	if (quotes.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Mail size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-[17px] font-medium text-[#1F2937]">아직 견적이 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">보통 2~3일 안에 첫 견적이 도착해요.</p>
			</div>
		);
	}

	return <QuoteCompareTable quotes={quotes} />;
}