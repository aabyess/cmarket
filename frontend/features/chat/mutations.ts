"use client";
import { createClient } from "@/libs/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CHAT_QUERY_KEYS } from "@/features/chat/queries";
import type { ChatMessage } from "@/features/chat/types";

export async function postMessage(quoteId: string, content: string): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content,
	});

	if (error) throw error;
}

export async function markMessagesRead(quoteId: string): Promise<void> {
	const supabase = createClient();

	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;

	await supabase
		.from("messages")
		.update({ is_read: true })
		.eq("quote_id", quoteId)
		.neq("sender_id", user.id)
		.eq("is_read", false);
}

export async function startChat(quoteId: string): Promise<void> {
	const supabase = createClient();

	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { count } = await supabase
		.from("messages")
		.select("*", { count: "exact", head: true })
		.eq("quote_id", quoteId);

	if ((count ?? 0) > 0) return;

	const { error } = await supabase.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content: "안녕하세요, 견적 관련해서 문의드립니다.",
	});

	if (error) throw error;
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