"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Send } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useFilterPresets } from "@/hooks/useFilterPresets";
import { MyQuotesCard } from "@/features/seller/components/MyQuotes/MyQuotesCard";
import { MyQuotesFilterBar } from "@/features/seller/components/MyQuotes/MyQuotesFilterBar";
import { MyQuotesTable } from "@/features/seller/components/MyQuotes/MyQuotesTable";
import { Pagination } from "@/components/commons/Pagination";
import type {
	MyQuotesFilter,
	MyQuotesFilterPresetValue,
	MyQuotesSort,
	MyQuotesViewMode,
} from "@/features/seller/components/MyQuotes/MyQuotesFilterBar";
import type { MyQuote } from "@/features/seller/types";

function isListingClosed(listingEndDate: string): boolean {
	return new Date(listingEndDate).getTime() <= Date.now();
}

type MyQuotesPrefs = {
	filter: MyQuotesFilter;
	sort: MyQuotesSort;
	viewMode: MyQuotesViewMode;
	pageSize: number;
};

const DEFAULT_PREFS: MyQuotesPrefs = {
	filter: "all",
	sort: "newest",
	viewMode: "grid",
	pageSize: 9,
};

type MyQuotesProps = {
	quotes: MyQuote[];
};

export function MyQuotes({ quotes }: MyQuotesProps) {
	const t = useTranslations("MyQuotes");
	const router = useRouter();
	const [prefs, setPrefs] = usePersistentState<MyQuotesPrefs>("mitrapay:seller-my-quotes", DEFAULT_PREFS);
	const { filter, sort, viewMode, pageSize } = prefs;
	const [page, setPage] = useState(1);
	const {
		presets: filterPresets,
		savePreset,
		deletePreset,
	} = useFilterPresets<MyQuotesFilterPresetValue>("mitrapay:seller-my-quotes-presets");

	function applyFilterPreset(value: MyQuotesFilterPresetValue): void {
		setPrefs((prev) => ({ ...prev, filter: value.filter, sort: value.sort }));
	}

	function saveFilterPreset(name: string): void {
		savePreset(name, { filter, sort });
	}

	function setFilter(filter: MyQuotesFilter): void {
		setPrefs((prev) => ({ ...prev, filter }));
	}

	function setSort(sort: MyQuotesSort): void {
		setPrefs((prev) => ({ ...prev, sort }));
	}

	function setViewMode(viewMode: MyQuotesViewMode): void {
		setPrefs((prev) => ({ ...prev, viewMode }));
	}

	function setPageSize(pageSize: number): void {
		setPrefs((prev) => ({ ...prev, pageSize }));
	}

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
			<div className="border-hairline rounded-2xl border bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Send size={26} className="text-subtle" />
				</div>
				<p className="text-base font-medium text-ink">{t("emptyTitle")}</p>
				<p className="mt-1 text-sm text-muted">
					{t("emptyDescription")}
				</p>
				<button
					onClick={() => router.push("/seller/listing-browse")}
					className="text-imsg-blue hover:bg-imsg-blue mt-5 rounded-lg bg-[#EFF6FF] px-6 py-3 text-sm font-semibold transition-colors hover:text-white"
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
				filterPresets={filterPresets}
				onApplyFilterPreset={applyFilterPreset}
				onSaveFilterPreset={saveFilterPreset}
				onDeleteFilterPreset={deletePreset}
			/>

			{sortedQuotes.length === 0 ? (
				<div className="border-hairline rounded-2xl border bg-white p-10 text-center">
					<p className="text-muted text-sm">{t("filteredEmpty")}</p>
				</div>
			) : (
				// 그리드↔테이블 전환 시 상태 칩이 이전 위치에서 새 위치로 이동하는 느낌을 주기
				// 위해 MyQuotesCard/MyQuotesTable의 상태 칩이 같은 layoutId를 공유한다(#161과
				// 동일 패턴). LayoutGroup으로 스코프하고, 컨테이너 자체엔 짧은 크로스페이드를
				// 얹어 layoutId 전환이 완벽하지 않아도 매끄럽게 보이게 한다.
				<LayoutGroup id="my-quotes">
					<AnimatePresence mode="popLayout" initial={false}>
						{viewMode === "grid" ? (
							<motion.div
								key="grid"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
							>
								{paginatedQuotes.map((quote) => (
									<MyQuotesCard
										key={quote.id}
										quote={quote}
										onViewListing={() => router.push(`/seller/listing-browse/${quote.listingId}`)}
										onGoToChat={() => router.push(`/seller/chat?quoteId=${quote.id}`)}
									/>
								))}
							</motion.div>
						) : (
							<motion.div
								key="table"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								<MyQuotesTable
									quotes={paginatedQuotes}
									onViewListing={(listingId) => router.push(`/seller/listing-browse/${listingId}`)}
									onGoToChat={(quoteId) => router.push(`/seller/chat?quoteId=${quoteId}`)}
								/>
							</motion.div>
						)}
					</AnimatePresence>
				</LayoutGroup>
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
