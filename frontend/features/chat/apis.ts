import { createClient } from "@/libs/supabase";
import type { ChatMessage } from "@/features/chat/types";

export type MessageRow = {
	id: string;
	sender_id: string;
	content: string;
	is_read: boolean;
	created_at: string;
	source_lang: string | null;
	translations: Record<string, string> | null;
	message_type: string | null;
	attachment_url: string | null;
	attachment_name: string | null;
};

// Realtime 페이로드도 같은 형태의 row라 캐시에 직접 반영할 때 재사용한다.
export function mapMessageRow(row: MessageRow): ChatMessage {
	return {
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
	};
}

export const MESSAGE_PAGE_SIZE = 50;

// 전체 이력을 한 번에 내려받지 않도록 최신순으로 한 페이지만 가져온다.
// before를 주면 그 시각 이전(더 오래된) 페이지를 가져온다. 반환은 항상 시간 오름차순.
export async function getMessages(
	quoteId: string,
	options?: { before?: string; limit?: number },
): Promise<ChatMessage[]> {
	const supabase = createClient();
	const limit = options?.limit ?? MESSAGE_PAGE_SIZE;

	let query = supabase
		.from("messages")
		.select(
			"id, sender_id, content, is_read, created_at, source_lang, translations, message_type, attachment_url, attachment_name",
		)
		.eq("quote_id", quoteId)
		.order("created_at", { ascending: false })
		.limit(limit);

	if (options?.before) {
		query = query.lt("created_at", options.before);
	}

	const { data, error } = await query;

	if (error) throw new Error(error.message);

	return (data ?? []).map((row) => mapMessageRow(row as MessageRow)).reverse();
}
