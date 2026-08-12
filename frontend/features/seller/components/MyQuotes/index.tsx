"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { MyQuotesCard } from "@/features/seller/components/MyQuotes/MyQuotesCard";
import { MyQuotesFilterBar } from "@/features/seller/components/MyQuotes/MyQuotesFilterBar";
import { MyQuotesTable } from "@/features/seller/components/MyQuotes/MyQuotesTable";
import type {
	MyQuotesFilter,
	MyQuotesViewMode,
} from "@/features/seller/components/MyQuotes/MyQuotesFilterBar";
import type { MyQuote, QuoteStatus } from "@/features/seller/types";

/** 아직 결과를 기다리는 견적이 먼저 와야 한다. 확정된 건은 계약 관리에서 다루므로 맨 뒤로 보낸다. */
const STATUS_ORDER: Record<QuoteStatus, number> = {
	pending: 0,
	rejected: 1,
	awarded: 2,
};

type MyQuotesProps = {
	quotes: MyQuote[];
};

export function MyQuotes({ quotes }: MyQuotesProps) {
	const router = useRouter();
	const [filter, setFilter] = useState<MyQuotesFilter>("all");
	const [viewMode, setViewMode] = useState<MyQuotesViewMode>("grid");

	const filteredQuotes =
		filter === "all"
			? [...quotes].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
			: quotes.filter((quote) => quote.status === filter);

	const counts: Record<MyQuotesFilter, number> = {
		all: quotes.length,
		pending: quotes.filter((q) => q.status === "pending").length,
		awarded: quotes.filter((q) => q.status === "awarded").length,
		rejected: quotes.filter((q) => q.status === "rejected").length,
	};

	if (quotes.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Send size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-base font-medium text-[#1F2937]">보낸 견적이 없어요</p>
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
			<MyQuotesFilterBar
				filter={filter}
				counts={counts}
				viewMode={viewMode}
				onFilterChange={setFilter}
				onViewModeChange={setViewMode}
			/>

			{filteredQuotes.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
					<p className="text-sm text-[#6B7280]">해당하는 견적이 없어요.</p>
				</div>
			) : viewMode === "grid" ? (
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
			) : (
				<MyQuotesTable
					quotes={filteredQuotes}
					onViewListing={(listingId) => router.push(`/seller/listing-browse/${listingId}`)}
					onGoToChat={(quoteId) => router.push(`/seller/chat/${quoteId}`)}
				/>
			)}
		</div>
	);
}