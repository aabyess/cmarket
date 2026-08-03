"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/features/chat/apis";

export const CHAT_QUERY_KEYS = {
	messages: (quoteId: string) => ["chat", "messages", quoteId] as const,
};

export function useMessages(quoteId: string | null) {
	return useQuery({
		queryKey: CHAT_QUERY_KEYS.messages(quoteId ?? ""),
		queryFn: () => getMessages(quoteId as string),
		enabled: Boolean(quoteId),
		staleTime: 1000 * 30,
	});
}