import { createClient } from "@/libs/supabase";
import type { ChatMessage } from "@/features/chat/types";

export async function getMessages(quoteId: string): Promise<ChatMessage[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("messages")
		.select("id, sender_id, content, is_read, created_at, translated_content, source_lang")
		.eq("quote_id", quoteId)
		.order("created_at", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => ({
		id: row.id,
		senderId: row.sender_id,
		content: row.content,
		isRead: row.is_read,
		createdAt: row.created_at,
		translatedContent: row.translated_content ?? null,
		sourceLang: row.source_lang ?? null,
	}));
}