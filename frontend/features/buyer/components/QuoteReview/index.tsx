"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Mail } from "lucide-react";
import { QuoteReviewQuoteCard } from "@/features/buyer/components/QuoteReview/QuoteReviewQuoteCard";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { startChat } from "@/features/chat/mutations";
import type { ReceivedQuote } from "@/features/buyer/types";

type QuoteReviewProps = {
	quotes: ReceivedQuote[];
	/** 기업 홈페이지에서 돌아올 경로. 서버에서 내려받아 useSearchParams 의존을 없앤다. */
	backHref: string;
};

export function QuoteReview({ quotes, backHref }: QuoteReviewProps): React.JSX.Element {
	const router = useRouter();
	const [startingId, setStartingId] = useState<string | null>(null);
	const [awardingId, setAwardingId] = useState<string | null>(null);
	const [confirmQuoteId, setConfirmQuoteId] = useState<string | null>(null);

	const comparablePrices = quotes.map((q) => q.priceInIdr).filter((p): p is number => p !== null);
	const lowestPriceInIdr = comparablePrices.length > 0 ? Math.min(...comparablePrices) : null;
	const fastestDays = quotes.length > 0 ? Math.min(...quotes.map((q) => q.deliveryDays)) : null;
	const hasAwardedQuote = quotes.some((q) => q.status === "awarded");

	async function handleStartChat(quoteId: string): Promise<void> {
		setStartingId(quoteId);
		const quote = quotes.find((q) => q.id === quoteId);
		try {
			await fetch("/api/chat/generate-quote-pdf", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId }),
			});
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
		}
	}

	async function handleAward(quoteId: string): Promise<void> {
		setAwardingId(quoteId);
		try {
			const res = await fetch("/api/buyer/award", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			const { invoiceWarning } = await res.json();
			if (invoiceWarning) alert(invoiceWarning);
			router.push(`/buyer/chat?quoteId=${quoteId}`);
		} catch (err) {
			console.error(err);
			alert("계약 확정 처리 중 오류가 발생했습니다.");
		} finally {
			setAwardingId(null);
			setConfirmQuoteId(null);
		}
	}

	if (quotes.length === 0) {
		return (
			<div className="rounded-2xl bg-white p-12 text-center shadow-sm">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-imsg-surface">
					<Mail size={24} className="text-imsg-secondary" />
				</div>
				<p className="text-base font-medium text-[#0f172a]">아직 견적이 없어요</p>
				<p className="mt-1 text-sm text-imsg-secondary">보통 2~3일 안에 첫 견적이 도착해요.</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				{quotes.map((quote) => (
					<QuoteReviewQuoteCard
						key={quote.id}
						quote={quote}
						backHref={backHref}
						isLowestPrice={lowestPriceInIdr !== null && quote.priceInIdr === lowestPriceInIdr}
						isFastest={quote.deliveryDays === fastestDays}
						isAwardDisabled={hasAwardedQuote}
						isStartingChat={startingId === quote.id}
						isAwarding={awardingId === quote.id}
						onStartChat={handleStartChat}
						onRequestAward={setConfirmQuoteId}
					/>
				))}
			</div>

			<ConfirmModal
				isOpen={confirmQuoteId !== null}
				title="이 견적으로 계약을 확정할까요?"
				description="확정하면 다른 견적은 선택할 수 없고, 공급기업에게 계약 사실이 통보됩니다."
				confirmLabel="계약 확정"
				variant="default"
				isLoading={awardingId === confirmQuoteId}
				onConfirm={() => confirmQuoteId && handleAward(confirmQuoteId)}
				onClose={() => setConfirmQuoteId(null)}
			/>
		</>
	);
}
