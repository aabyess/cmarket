// features/buyer/components/QuoteReview/quoteReviewUtils.ts
import type { ReceivedQuote } from "@/features/buyer/types";

// 최저가/최속납기 견적이 자연 정렬(가격순) 상위 N위 밖으로 밀려나 있으면,
// 상위 N위 중 필수 포함 항목이 아닌 마지막(순위가 가장 낮은) 자리를 대신 채운다.
export function selectTopQuotes(quotes: ReceivedQuote[], limit: number): ReceivedQuote[] {
	if (quotes.length <= limit) return quotes;

	const lowestPriceQuote = findLowestPriceQuote(quotes);
	const fastestQuote = findFastestQuote(quotes);
	const mustIncludeIds = new Set(
		[lowestPriceQuote?.id, fastestQuote?.id].filter((id): id is string => id !== undefined),
	);

	const selected = quotes.slice(0, limit);
	const selectedIds = new Set(selected.map((quote) => quote.id));

	const missing = [lowestPriceQuote, fastestQuote].filter(
		(quote): quote is ReceivedQuote => quote !== undefined && !selectedIds.has(quote.id),
	);
	const missingUnique = missing.filter(
		(quote, index) => missing.findIndex((candidate) => candidate.id === quote.id) === index,
	);

	for (const quote of missingUnique) {
		let replaceIndex = -1;
		for (let i = selected.length - 1; i >= 0; i -= 1) {
			if (!mustIncludeIds.has(selected[i].id)) {
				replaceIndex = i;
				break;
			}
		}
		if (replaceIndex === -1) break;
		selectedIds.delete(selected[replaceIndex].id);
		selected[replaceIndex] = quote;
		selectedIds.add(quote.id);
	}

	// 원래 정렬(가격순) 순서를 유지한 채로 반환한다.
	const orderIndex = new Map(quotes.map((quote, index) => [quote.id, index]));
	return [...selected].sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));
}

function findLowestPriceQuote(quotes: ReceivedQuote[]): ReceivedQuote | undefined {
	const candidates = quotes.filter((quote) => quote.priceInIdr !== null);
	if (candidates.length === 0) return undefined;
	return candidates.reduce((lowest, quote) =>
		(quote.priceInIdr as number) < (lowest.priceInIdr as number) ? quote : lowest,
	);
}

function findFastestQuote(quotes: ReceivedQuote[]): ReceivedQuote | undefined {
	if (quotes.length === 0) return undefined;
	return quotes.reduce((fastest, quote) => (quote.deliveryDays < fastest.deliveryDays ? quote : fastest));
}

export type QuoteRecommendation = {
	quote: ReceivedQuote;
	priceRank: number;
	deliveryRank: number;
	totalCount: number;
};

// 결정적 점수식(AI 아님) — 통화가 섞여 있어 priceInIdr 기준으로 min-max 정규화한 뒤
// 가격 0.6 + 납기 0.4 가중합(낮을수록 좋음)으로 계산한다. priceInIdr가 없는 견적은
// 다른 통화와 비교 불가능하므로 추천 대상에서 제외한다.
export function getRecommendedQuote(quotes: ReceivedQuote[]): QuoteRecommendation | null {
	const candidates = quotes.filter(
		(quote): quote is ReceivedQuote & { priceInIdr: number } => quote.priceInIdr !== null,
	);
	// 비교 대상이 1건 이하면 "가격 1위/납기 1위" 같은 순위 비교가 의미 없어 추천을 생략한다.
	if (candidates.length < 2) return null;

	const prices = candidates.map((quote) => quote.priceInIdr);
	const deliveries = candidates.map((quote) => quote.deliveryDays);
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const minDelivery = Math.min(...deliveries);
	const maxDelivery = Math.max(...deliveries);

	function normalize(value: number, min: number, max: number): number {
		return max === min ? 0 : (value - min) / (max - min);
	}

	function score(quote: (typeof candidates)[number]): number {
		return (
			normalize(quote.priceInIdr, minPrice, maxPrice) * 0.6 +
			normalize(quote.deliveryDays, minDelivery, maxDelivery) * 0.4
		);
	}

	let best = candidates[0];
	let bestScore = score(best);

	for (const quote of candidates.slice(1)) {
		const quoteScore = score(quote);
		// 동점이면 가격이 더 낮은 쪽을 우선한다.
		if (quoteScore < bestScore || (quoteScore === bestScore && quote.priceInIdr < best.priceInIdr)) {
			best = quote;
			bestScore = quoteScore;
		}
	}

	const priceRank = candidates.filter((quote) => quote.priceInIdr < best.priceInIdr).length + 1;
	const deliveryRank = candidates.filter((quote) => quote.deliveryDays < best.deliveryDays).length + 1;

	return { quote: best, priceRank, deliveryRank, totalCount: candidates.length };
}
