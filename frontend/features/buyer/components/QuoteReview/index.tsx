"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { QuoteReviewQuoteCard } from "@/features/buyer/components/QuoteReview/QuoteReviewQuoteCard";
import { QuoteReviewRecommendedCard } from "@/features/buyer/components/QuoteReview/QuoteReviewRecommendedCard";
import { QuoteCompareTable } from "@/features/buyer/components/QuoteReview/QuoteCompareTable";
import {
	getPriceDeliveryHighlight,
	getRecommendedQuote,
	selectTopQuotes,
} from "@/features/buyer/components/QuoteReview/quoteReviewUtils";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import { startChat } from "@/features/chat/mutations";
import { ChatStartLoadingModal } from "@/features/chat/components/ChatStartLoadingModal";
import type { ListingItem, ReceivedQuote } from "@/features/buyer/types";

const TOP_QUOTES_LIMIT = 5;

type QuoteReviewProps = {
	quotes: ReceivedQuote[];
	listingItems: ListingItem[];
	/** 기업 홈페이지에서 돌아올 경로. 서버에서 내려받아 useSearchParams 의존을 없앤다. */
	backHref: string;
};

export function QuoteReview({ quotes, listingItems, backHref }: QuoteReviewProps): React.JSX.Element {
	const t = useTranslations("QuoteReview");
	const router = useRouter();
	const [startingId, setStartingId] = useState<string | null>(null);
	const [chatStartStep, setChatStartStep] = useState<"preparing" | "navigating" | null>(null);
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [showAllQuotes, setShowAllQuotes] = useState(false);

	const comparablePrices = quotes.map((q) => q.priceInIdr).filter((p): p is number => p !== null);
	const lowestPriceInIdr = comparablePrices.length > 0 ? Math.min(...comparablePrices) : null;
	const fastestDays = quotes.length > 0 ? Math.min(...quotes.map((q) => q.deliveryDays)) : null;
	// 카드 가격/납기 값의 최고가·최장납기 색상 강조(항상 전체 quotes 기준 — 상위5 토글과 무관).
	const { highestPriceInIdr, slowestDays, hasPriceHighlight, hasDeliveryHighlight } =
		getPriceDeliveryHighlight(quotes);

	const topQuotes = useMemo(() => selectTopQuotes(quotes, TOP_QUOTES_LIMIT), [quotes]);
	const visibleQuotes = showAllQuotes ? quotes : topQuotes;
	const hasMoreQuotes = quotes.length > TOP_QUOTES_LIMIT;
	const recommendation = useMemo(() => getRecommendedQuote(quotes), [quotes]);

	async function handleStartChat(quoteId: string): Promise<void> {
		setStartingId(quoteId);
		setChatStartStep("preparing");
		const quote = quotes.find((q) => q.id === quoteId);
		try {
			await fetch("/api/chat/generate-quote-pdf", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId, sendPair: true }),
			});
			setChatStartStep("navigating");
			await startChat(quoteId, {
				price: quote?.price ?? 0,
				currency: quote?.currency ?? "USD",
				deliveryDays: quote?.deliveryDays ?? 0,
				sellerCompanyName: quote?.seller.companyName ?? "",
				previousPrice: quote?.previousPrice ?? null,
				previousDeliveryDays: quote?.previousDeliveryDays ?? null,
			});
			router.push(`/buyer/chat?quoteId=${quoteId}`);
		} catch (err) {
			console.error(err);
			setStartingId(null);
		} finally {
			setChatStartStep(null);
		}
	}

	if (quotes.length === 0) {
		return (
			<div className="rounded-2xl bg-white p-12 text-center shadow-sm">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-imsg-surface">
					<Mail size={24} className="text-imsg-secondary" />
				</div>
				<p className="text-base font-medium text-[#0f172a]">{t("emptyTitle")}</p>
				<p className="mt-1 text-sm text-imsg-secondary">{t("emptyDescription")}</p>
			</div>
		);
	}

	return (
		<>
			{chatStartStep && <ChatStartLoadingModal step={chatStartStep} />}

			<div className="mb-4 flex justify-end">
				<ViewModeToggle value={viewMode} onChange={setViewMode} />
			</div>

			{/* 그리드↔테이블 전환 시 가격이 이전 위치에서 새 위치로 이동하는 느낌을 주기 위해
			    QuoteReviewQuoteCard/QuoteCompareTable의 가격 요소가 같은 layoutId를 공유한다.
			    LayoutGroup으로 이 영역의 layout 계산을 스코프하고, AnimatePresence로 그리드/
			    테이블 컨테이너 자체는 짧은 크로스페이드를 줘 전환 중 레이아웃 점프를 줄인다. */}
			<LayoutGroup id="quote-review">
				<AnimatePresence mode="popLayout" initial={false}>
					{viewMode === "grid" ? (
						<motion.div
							key="grid"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{visibleQuotes.map((quote) => (
								<QuoteReviewQuoteCard
									key={quote.id}
									quote={quote}
									listingItems={listingItems}
									backHref={backHref}
									isLowestPrice={lowestPriceInIdr !== null && quote.priceInIdr === lowestPriceInIdr}
									isFastest={quote.deliveryDays === fastestDays}
									isHighestPrice={hasPriceHighlight && quote.priceInIdr === highestPriceInIdr}
									isSlowestDelivery={hasDeliveryHighlight && quote.deliveryDays === slowestDays}
									isStartingChat={startingId === quote.id}
									onStartChat={handleStartChat}
								/>
							))}
						</motion.div>
					) : (
						<motion.div
							key="table"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}>
							<QuoteCompareTable quotes={visibleQuotes} />
						</motion.div>
					)}
				</AnimatePresence>
			</LayoutGroup>

			{hasMoreQuotes && (
				<button
					type="button"
					onClick={() => setShowAllQuotes((prev) => !prev)}
					className="border-hairline hover:bg-imsg-surface mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border bg-white py-2.5 text-sm font-medium text-[#374151] transition-colors">
					{showAllQuotes ? (
						<>
							<ChevronUp size={14} />
							{t("collapseToggle")}
						</>
					) : (
						<>
							<ChevronDown size={14} />
							{t("showAllToggle", { count: quotes.length })}
						</>
					)}
				</button>
			)}

			{recommendation && (
				<QuoteReviewRecommendedCard
					recommendation={recommendation}
					backHref={backHref}
					isStartingChat={startingId === recommendation.quote.id}
					onStartChat={handleStartChat}
				/>
			)}
		</>
	);
}
