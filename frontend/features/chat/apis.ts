import { createClient } from "@/libs/supabase";
import type { ChatMessage } from "@/features/chat/types";

export async function getMessages(quoteId: string): Promise<ChatMessage[]> {
	const supabase = createClient();

	const { data, error } = await supabase
		.from("messages")
		.select(
			"id, sender_id, content, is_read, created_at, source_lang, translations, message_type, attachment_url, attachment_name",
		)
		.eq("quote_id", quoteId)
		.order("created_at", { ascending: true });

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => ({
		id: row.id,
		senderId: row.sender_id,
		content: row.content,
		isRead: row.is_read,
		createdAt: row.created_at,
		sourceLang: row.source_lang ?? null,
		translations: row.translations ?? null,
		messageType: (row.message_type ?? "text") as ChatMessage["messageType"],
		attachmentUrl: row.attachment_url ?? null,
		attachmentName: row.attachment_name ?? null,
	}));
}