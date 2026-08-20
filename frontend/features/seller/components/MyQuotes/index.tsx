"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Send } from "lucide-react";
import { MyQuotesCard } from "@/features/seller/components/MyQuotes/MyQuotesCard";
import { MyQuotesFilterBar } from "@/features/seller/components/MyQuotes/MyQuotesFilterBar";
import { MyQuotesTable } from "@/features/seller/components/MyQuotes/MyQuotesTable";
import { Pagination } from "@/components/commons/Pagination";
import type {
	MyQuotesFilter,
	MyQuotesSort,
	MyQuotesViewMode,
} from "@/features/seller/components/MyQuotes/MyQuotesFilterBar";
import type { MyQuote } from "@/features/seller/types";

function isListingClosed(listingEndDate: string): boolean {
	return new Date(listingEndDate).getTime() <= Date.now();
}

type MyQuotesProps = {
	quotes: MyQuote[];
};

export function MyQuotes({ quotes }: MyQuotesProps) {
	const t = useTranslations("MyQuotes");
	const router = useRouter();
	const [filter, setFilter] = useState<MyQuotesFilter>("all");
	const [sort, setSort] = useState<MyQuotesSort>("newest");
	const [viewMode, setViewMode] = useState<MyQuotesViewMode>("grid");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(9);

	const statusFiltered = filter === "all" ? quotes : quotes.filter((quote) => quote.status === filter);

	const sortedQuotes = [...statusFiltered].sort((a, b) => {
		switch (sort) {
			case "oldest":
				return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
			case "deadline": {
				const aClosed = isListingClosed(a.listingEndDate);
				const bClosed = isListingClosed(b.listingEndDate);
				if (aClosed !== bClosed) return aClosed ? 1 : -1;
				return new Date(a.listingEndDate).getTime() - new Date(b.listingEndDate).getTime();
			}
			case "newest":
			default:
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		}
	});

	useEffect(() => {
		setPage(1);
	}, [filter, sort, pageSize]);

	const pageCount = Math.max(1, Math.ceil(sortedQuotes.length / pageSize));
	const paginatedQuotes = sortedQuotes.slice((page - 1) * pageSize, page * pageSize);

	if (quotes.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Send size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-base font-medium text-[#1F2937]">{t("emptyTitle")}</p>
				<p className="mt-1 text-sm text-[#6B7280]">
					{t("emptyDescription")}
				</p>
				<button
					onClick={() => router.push("/seller/listing-browse")}
					className="mt-5 rounded-lg bg-imsg-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
				>
					{t("emptyCta")}
				</button>
			</div>
		);
	}

	return (
		<div>
			<MyQuotesFilterBar
				filter={filter}
				sort={sort}
				viewMode={viewMode}
				onFilterChange={setFilter}
				onSortChange={setSort}
				onViewModeChange={setViewMode}
			/>

			{sortedQuotes.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-10 text-center">
					<p className="text-sm text-[#6B7280]">{t("filteredEmpty")}</p>
				</div>
			) : viewMode === "grid" ? (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{paginatedQuotes.map((quote) => (
						<MyQuotesCard
							key={quote.id}
							quote={quote}
							onViewListing={() => router.push(`/seller/listing-browse/${quote.listingId}`)}
							onGoToChat={() => router.push(`/seller/chat?quoteId=${quote.id}`)}
						/>
					))}
				</div>
			) : (
				<MyQuotesTable
					quotes={paginatedQuotes}
					onViewListing={(listingId) => router.push(`/seller/listing-browse/${listingId}`)}
					onGoToChat={(quoteId) => router.push(`/seller/chat?quoteId=${quoteId}`)}
				/>
			)}

			{sortedQuotes.length > 0 && (
				<Pagination
					page={page}
					pageCount={pageCount}
					pageSize={pageSize}
					onPageChange={setPage}
					onPageSizeChange={setPageSize}
					pageSizeOptions={[9, 18, 30, 60]}
				/>
			)}
		</div>
	);
}
