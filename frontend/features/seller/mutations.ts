import { createClient } from "@/libs/supabase";
import { translateField } from "@/utils/translateField";
import type { QuoteFormData } from "@/features/seller/types";

// 발주사에게 알림을 남겨야 하는데 그건 남의 행이라 RLS 를 통과하지 못한다.
// 견적 저장과 알림 생성을 한 곳에서 처리하려고 서버 라우트를 거친다.
export async function postQuote(listingId: string, data: QuoteFormData): Promise<void> {
	const noteTranslation = await translateField(data.note);

	const res = await fetch("/api/quote", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			listingId,
			price: data.price,
			currency: data.currency,
			deliveryDays: data.deliveryDays,
			note: data.note,
			noteSourceLang: noteTranslation?.sourceLang ?? null,
			noteTranslations: noteTranslation?.translations ?? null,
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

export async function updateQuote(quoteId: string, data: QuoteFormData): Promise<void> {
	const supabase = createClient();

	const { data: current, error: fetchError } = await supabase
		.from("quotes")
		.select("price, delivery_days")
		.eq("id", quoteId)
		.single();

	if (fetchError) throw fetchError;

	const noteTranslation = await translateField(data.note);

	const { error } = await supabase
		.from("quotes")
		.update({
			price: data.price,
			currency: data.currency,
			delivery_days: data.deliveryDays,
			note: data.note,
			note_source_lang: noteTranslation?.sourceLang ?? null,
			note_translations: noteTranslation?.translations ?? null,
			items: data.items,
			attachments: data.attachments,
			payment_terms: data.paymentTerms,
			previous_price: current.price,
			previous_delivery_days: current.delivery_days,
			revised_at: new Date().toISOString(),
		})
		.eq("id", quoteId);

	if (error) throw error;

	// 옛 가격/납기로 만들어진 캐시 PDF가 계속 나오지 않도록 지운다.
	// 실패해도 견적 수정 자체를 되돌리지는 않는다 — 다음 PDF 요청 때 재생성될 뿐이다.
	try {
		const res = await fetch("/api/quote/invalidate-pdf", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ quoteId }),
		});
		if (!res.ok) {
			const { error: invalidateError } = await res.json();
			console.error("quote PDF invalidate error:", invalidateError);
		}
	} catch (invalidateError) {
		console.error("quote PDF invalidate error:", invalidateError);
	}
}