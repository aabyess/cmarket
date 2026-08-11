"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { cn } from "@/utils/cn";
import { MyQuotesCard } from "@/features/seller/components/MyQuotes/MyQuotesCard";
import type { MyQuote, QuoteStatus } from "@/features/seller/types";

type FilterValue = "all" | QuoteStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
	{ value: "all", label: "전체" },
	{ value: "pending", label: "검토 중" },
	{ value: "awarded", label: "계약 확정" },
	{ value: "rejected", label: "미선정" },
];

type MyQuotesProps = {
	quotes: MyQuote[];
};

export function MyQuotes({ quotes }: MyQuotesProps) {
	const router = useRouter();
	const [filter, setFilter] = useState<FilterValue>("all");

	const filteredQuotes =
		filter === "all" ? quotes : quotes.filter((quote) => quote.status === filter);

	function getCount(value: FilterValue): number {
		if (value === "all") return quotes.length;
		return quotes.filter((quote) => quote.status === value).length;
	}

	if (quotes.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Send size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-[17px] font-medium text-[#1F2937]">보낸 견적이 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">
					열려 있는 공고를 찾아 첫 견적을 보내보세요.
				</p>
				<button
					onClick={() => router.push("/seller/listing-browse")}
					className="mt-5 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
				>
					견적요청 둘러보기
				</button>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-4 flex gap-2">
				{FILTERS.map((item) => (
					<button
						key={item.value}
						onClick={() => setFilter(item.value)}
						className={cn(
							"rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors",
							filter === item.value
								? "border-[#3B82F6] bg-[#3B82F6] text-white"
								: "border-[#E2E8F0] bg-white text-[#374151] hover:bg-[#F9FAFB]",
						)}
					>
						{item.label} {getCount(item.value)}
					</button>
				))}
			</div>

			{filteredQuotes.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
					<p className="text-sm text-[#6B7280]">해당하는 견적이 없어요.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{filteredQuotes.map((quote) => (
						<MyQuotesCard
							key={quote.id}
							quote={quote}
							onViewListing={() => router.push(`/seller/listing-browse/${quote.listingId}`)}
							onGoToChat={() => router.push(`/seller/chat/${quote.id}`)}
						/>
					))}
				</div>
			)}
		</div>
	);
}