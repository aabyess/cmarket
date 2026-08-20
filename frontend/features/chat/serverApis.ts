import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import type { ChatContext, ChatRole, ChatRoom } from "@/features/chat/types";

type QuoteRow = {
	id: string;
	listing_id: string;
	seller_id: string;
	price: number;
	currency: string;
	delivery_days: number;
	status: "pending" | "awarded" | "rejected";
	listings: {
		title: string;
		title_source_lang: string | null;
		title_translations: Record<string, string> | null;
		user_id: string;
	} | null;
};

export async function getChatRooms(role: ChatRole): Promise<ChatRoom[]> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return [];
	const locale = await getLocale();

	let quoteIds: string[] = [];

	if (role === "seller") {
		const { data } = await supabase.from("quotes").select("id").eq("seller_id", user.id);
		quoteIds = (data ?? []).map((row) => row.id);
	} else {
		const { data: listings } = await supabase.from("listings").select("id").eq("user_id", user.id);
		const listingIds = (listings ?? []).map((row) => row.id);
		if (listingIds.length === 0) return [];

		const { data } = await supabase.from("quotes").select("id").in("listing_id", listingIds);
		quoteIds = (data ?? []).map((row) => row.id);
	}

	if (quoteIds.length === 0) return [];

	const { data: messages } = await supabase
		.from("messages")
		.select("quote_id, content, created_at, sender_id, is_read, message_type")
		.in("quote_id", quoteIds)
		.order("created_at", { ascending: false });

	const activeQuoteIds = [...new Set((messages ?? []).map((m) => m.quote_id))];
	if (activeQuoteIds.length === 0) return [];

	const { data: quotes } = await supabase
		.from("quotes")
		.select(
			"id, listing_id, seller_id, price, currency, delivery_days, status, listings(title, title_source_lang, title_translations, user_id)",
		)
		.in("id", activeQuoteIds);

	const quoteRows = (quotes ?? []) as unknown as QuoteRow[];

	const partnerIds = [
		...new Set(
			quoteRows
				.map((q) => (role === "seller" ? q.listings?.user_id : q.seller_id))
				.filter((id): id is string => Boolean(id)),
		),
	];

	// 두 조회는 서로 독립이므로 병렬로 실행한다.
	const [{ data: companies }, { data: contracts }] = await Promise.all([
		supabase.from("companies").select("profile_id, company_name").in("profile_id", partnerIds),
		supabase.from("contracts").select("quote_id").in("quote_id", activeQuoteIds),
	]);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c.company_name]));
	const contractSet = new Set((contracts ?? []).map((c) => c.quote_id));

	// 방마다 전체 메시지 배열을 다시 filter하면 O(방 수 × 메시지 수)가 된다. 한 번만 그룹핑한다.
	const messagesByQuote = new Map<string, typeof messages>();
	for (const message of messages ?? []) {
		const group = messagesByQuote.get(message.quote_id);
		if (group) {
			group.push(message);
		} else {
			messagesByQuote.set(message.quote_id, [message]);
		}
	}

	// PDF 카드 메시지는 content가 메타 JSON이라 목록 미리보기에 그대로 노출되면 안 된다.
	const tRoom = await getTranslations("ChatRoomList");

	function toPreview(latest: { content: string; message_type: string | null } | undefined): string {
		if (!latest) return "";
		if (latest.message_type === "invoice_pdf") return tRoom("invoicePdfPreview");
		if (latest.message_type === "quote_pdf") return tRoom("quotePdfPreview");
		return latest.content;
	}

	return quoteRows
		.map((quote) => {
			const roomMessages = messagesByQuote.get(quote.id) ?? [];
			const latest = roomMessages[0];
			const partnerId = role === "seller" ? (quote.listings?.user_id ?? "") : quote.seller_id;

			return {
				quoteId: quote.id,
				listingId: quote.listing_id,
				listingTitle: quote.listings
					? resolveTranslatedField(
							quote.listings.title,
							quote.listings.title_source_lang,
							quote.listings.title_translations,
							locale,
						)
					: "",
				partnerId,
				partnerName: companyMap.get(partnerId) ?? "",
				price: Number(quote.price),
				currency: quote.currency as ChatRoom["currency"],
				deliveryDays: quote.delivery_days,
				quoteStatus: quote.status,
				hasContract: contractSet.has(quote.id),
				lastMessage: toPreview(latest),
				lastMessageAt: latest?.created_at ?? null,
				unreadCount: roomMessages.filter((m) => !m.is_read && m.sender_id !== user.id).length,
			};
		})
		.sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

export async function getChatContext(role: ChatRole): Promise<ChatContext | null> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const rooms = await getChatRooms(role);

	return { myId: user.id, myRole: role, rooms };
}
