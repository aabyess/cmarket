import type { QuoteDraft, QuoteFormData } from "@/features/seller/types";

// 발주사에게 알림을 남겨야 하는데 그건 남의 행이라 RLS 를 통과하지 못한다.
// 견적 저장과 알림 생성을 한 곳에서 처리하려고 서버 라우트를 거친다.
// 번역도 서버에서 만든다 — 클라이언트가 만든 번역은 원문과 다르게 위조될 수 있다.
export async function postQuote(listingId: string, data: QuoteFormData): Promise<void> {
	const res = await fetch("/api/quote", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			listingId,
			price: data.price,
			currency: data.currency,
			deliveryDays: data.deliveryDays,
			note: data.note,
			items: data.items,
			attachments: data.attachments,
			paymentTerms: data.paymentTerms,
		}),
	});

	if (!res.ok) {
		const { error } = await res.json();
		throw new Error(error ?? "견적 제출에 실패했습니다.");
	}
}

// 수정도 서버 라우트에서 처리한다 — 번역 생성, 가격 이력 기록, 캐시 PDF 무효화가 한 곳에서 끝난다.
export async function updateQuote(quoteId: string, data: QuoteFormData): Promise<void> {
	const res = await fetch("/api/quote", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			quoteId,
			price: data.price,
			currency: data.currency,
			deliveryDays: data.deliveryDays,
			note: data.note,
			items: data.items,
			attachments: data.attachments,
			paymentTerms: data.paymentTerms,
		}),
	});

	if (!res.ok) {
		const { error } = await res.json();
		throw new Error(error ?? "견적 수정에 실패했습니다.");
	}
}

export class QuoteDraftError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "QuoteDraftError";
		this.status = status;
	}
}

// 공고 내용을 바탕으로 견적 메모/결제조건 초안을 AI가 생성한다. 가격은 생성하지 않는다.
export async function draftQuoteWithAi(
	listingId: string,
	locale: string,
	instructions?: string,
): Promise<QuoteDraft> {
	const res = await fetch("/api/ai/draft-quote", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ listingId, locale, instructions }),
	});

	if (!res.ok) {
		const { error } = await res.json();
		throw new QuoteDraftError(res.status, error ?? "AI 초안 생성에 실패했습니다.");
	}

	return res.json();
}
