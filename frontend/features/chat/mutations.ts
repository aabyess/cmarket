"use client";
import { createClient } from "@/libs/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CHAT_QUERY_KEYS } from "@/features/chat/queries";
import type { ChatMessage } from "@/features/chat/types";

export async function postMessage(quoteId: string, content: string): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	// 번역 시도 (실패해도 메시지 전송은 진행)
	let translatedContent: string | null = null;
	let sourceLang: string | null = null;

	try {
		const res = await fetch("/api/translate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text: content, targetLang: "KO" }),
		});
		const data = await res.json();
	
		// 이미 한국어면 번역 저장 안 함
		if (data.detectedLang !== "KO") {
			translatedContent = data.translatedText;
			sourceLang = data.detectedLang;
		} else {
			// 한국어면 인도네시아어로 번역
			const res2 = await fetch("/api/translate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: content, targetLang: "ID" }),
			});
			const data2 = await res2.json();
			if (data2.translatedText) {
				translatedContent = data2.translatedText;
				sourceLang = "KO";
			}
		}
	} catch {
		// 번역 실패해도 메시지 전송은 계속
	}

	const { error } = await supabase.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content,
		translated_content: translatedContent,
		source_lang: sourceLang,
	});

	if (error) throw error;
}

export async function markMessagesRead(quoteId: string): Promise<void> {
	const supabase = createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;

	const { error } = await supabase
		.from("messages")
		.update({ is_read: true })
		.eq("quote_id", quoteId)
		.neq("sender_id", user.id)
		.eq("is_read", false);

	if (error) console.error("markMessagesRead error:", error);
}

type QuoteSummary = {
	price: number;
	currency: string;
	deliveryDays: number;
	sellerCompanyName: string;
	previousPrice: number | null;
	previousDeliveryDays: number | null;
};

export async function startChat(quoteId: string, summary: QuoteSummary): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { count } = await supabase
		.from("messages")
		.select("*", { count: "exact", head: true })
		.eq("quote_id", quoteId)
		.eq("message_type", "text");

	if ((count ?? 0) > 0) return;
	
	if (summary.previousPrice !== null && summary.previousDeliveryDays !== null) {
		const priceDiff = summary.price - summary.previousPrice;
		const daysDiff = summary.deliveryDays - summary.previousDeliveryDays;

		const priceDiffText =
			priceDiff === 0 ? "변동 없음" : `${priceDiff > 0 ? "+" : ""}${priceDiff.toLocaleString()}`;
		const daysDiffText = daysDiff === 0 ? "변동 없음" : `${daysDiff > 0 ? "+" : ""}${daysDiff}일`;

		const comparisonContent = [
			"📊 견적 변경 내역",
			`가격: ${summary.currency} ${summary.previousPrice.toLocaleString()} → ${summary.currency} ${summary.price.toLocaleString()} (${priceDiffText})`,
			`납기: ${summary.previousDeliveryDays}일 → ${summary.deliveryDays}일 (${daysDiffText})`,
		].join("\n");

		const { error: comparisonError } = await supabase.from("messages").insert({
			quote_id: quoteId,
			sender_id: user.id,
			content: comparisonContent,
		});

		if (comparisonError) throw comparisonError;
	}

	const summaryContent = [
		"📋 견적 요약",
		`가격: ${summary.currency} ${summary.price.toLocaleString()}`,
		`납기: ${summary.deliveryDays}일`,
		`업체명: ${summary.sellerCompanyName}`,
	].join("\n");

	const { error: summaryError } = await supabase.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content: summaryContent,
	});

	if (summaryError) throw summaryError;

	const { error: greetingError } = await supabase.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content: "안녕하세요, 견적 관련해서 문의드립니다.",
	});

	if (greetingError) throw greetingError;
}

export async function awardAndCreateContract(
	listingId: string,
	quoteId: string,
	sellerId: string,
): Promise<void> {
	const res = await fetch("/api/buyer/award", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ quoteId }),
	});

	if (!res.ok) {
		const { error } = await res.json();
		throw new Error(error ?? "낙찰 처리 실패");
	}
}

export function useSendMessage(quoteId: string, myId: string) {
	const queryClient = useQueryClient();
	const queryKey = CHAT_QUERY_KEYS.messages(quoteId);

	return useMutation({
		mutationFn: (content: string) => postMessage(quoteId, content),

		onMutate: async (content: string) => {
			await queryClient.cancelQueries({ queryKey });
			const previous = queryClient.getQueryData<ChatMessage[]>(queryKey);

			const optimistic: ChatMessage = {
				id: `temp-${Date.now()}`,
				senderId: myId,
				content,
				isRead: false,
				createdAt: new Date().toISOString(),
				translatedContent: null,
				sourceLang: null,
				messageType: "text",
				attachmentUrl: null,
				attachmentName: null,
			};

			queryClient.setQueryData<ChatMessage[]>(queryKey, (old) => [...(old ?? []), optimistic]);

			return { previous };
		},

		onError: (_err, _content, context) => {
			if (context?.previous) {
				queryClient.setQueryData(queryKey, context.previous);
			}
		},

		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	});
}