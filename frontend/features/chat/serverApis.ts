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

export async function getChatRooms(
	role: ChatRole,
	alwaysIncludeQuoteId?: string,
): Promise<ChatRoom[]> {
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

	// 전체 메시지 이력을 내려받지 않고 방별 최신 메시지/안읽음 수만 DB에서 집계한다.
	// RPC 마이그레이션이 아직 적용되지 않은 환경에서는 기존 방식으로 폴백한다.
	type RoomSummary = {
		quote_id: string;
		last_content: string;
		last_message_type: string | null;
		last_created_at: string;
		unread_count: number;
	};

	let summaries: RoomSummary[];

	const [{ data: rpcSummaries, error: rpcError }, { data: hiddenRooms }] = await Promise.all([
		supabase.rpc("get_chat_room_summaries", {
			p_quote_ids: quoteIds,
			p_user_id: user.id,
		}),
		supabase
			.from("chat_hidden_rooms")
			.select("quote_id, hidden_at")
			.eq("profile_id", user.id)
			.in("quote_id", quoteIds),
	]);

	if (rpcError) {
		console.error("get_chat_room_summaries rpc 실패, 전체 조회로 폴백:", rpcError.message);
		const { data: messages } = await supabase
			.from("messages")
			.select("quote_id, content, created_at, sender_id, is_read, message_type")
			.in("quote_id", quoteIds)
			.order("created_at", { ascending: false });

		const byQuote = new Map<string, RoomSummary>();
		for (const m of messages ?? []) {
			const existing = byQuote.get(m.quote_id);
			if (existing) {
				if (!m.is_read && m.sender_id !== user.id) existing.unread_count += 1;
			} else {
				byQuote.set(m.quote_id, {
					quote_id: m.quote_id,
					last_content: m.content,
					last_message_type: m.message_type,
					last_created_at: m.created_at,
					unread_count: !m.is_read && m.sender_id !== user.id ? 1 : 0,
				});
			}
		}
		summaries = [...byQuote.values()];
	} else {
		summaries = (rpcSummaries ?? []) as RoomSummary[];
	}

	const summaryMap = new Map(summaries.map((s) => [s.quote_id, s]));
	const activeQuoteIds = summaries.map((s) => s.quote_id);
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
		supabase
			.from("companies")
			.select("profile_id, company_name, verification_status")
			.in("profile_id", partnerIds),
		supabase.from("contracts").select("quote_id").in("quote_id", activeQuoteIds),
	]);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c.company_name]));
	const verificationMap = new Map(
		(companies ?? []).map((c) => [
			c.profile_id,
			c.verification_status as ChatRoom["partnerVerificationStatus"],
		]),
	);
	const contractSet = new Set((contracts ?? []).map((c) => c.quote_id));

	// PDF 카드 메시지는 content가 메타 JSON이라 목록 미리보기에 그대로 노출되면 안 된다.
	const tRoom = await getTranslations("ChatRoomList");

	function toPreview(
		latest: { last_content: string; last_message_type: string | null } | undefined,
	): string {
		if (!latest) return "";
		if (latest.last_message_type === "invoice_pdf") return tRoom("invoicePdfPreview");
		if (latest.last_message_type === "quote_pdf") return tRoom("quotePdfPreview");
		if (latest.last_message_type === "image") return tRoom("imagePreview");
		if (latest.last_message_type === "file") return tRoom("filePreview");
		if (latest.last_message_type === "info") return tRoom("infoPreview");
		return latest.last_content;
	}

	const hiddenAtMap = new Map((hiddenRooms ?? []).map((row) => [row.quote_id, row.hidden_at]));

	return quoteRows
		.map((quote) => {
			const summary = summaryMap.get(quote.id);
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
				partnerVerificationStatus: verificationMap.get(partnerId) ?? "unverified",
				price: Number(quote.price),
				currency: quote.currency as ChatRoom["currency"],
				deliveryDays: quote.delivery_days,
				quoteStatus: quote.status,
				hasContract: contractSet.has(quote.id),
				lastMessage: toPreview(summary),
				lastMessageAt: summary?.last_created_at ?? null,
				unreadCount: Number(summary?.unread_count ?? 0),
			};
		})
		.filter((room) => {
			// 알림 클릭 등 ?quoteId= 직접 진입은 목록 필터를 거치지 않고 그대로 열려야 한다.
			if (room.quoteId === alwaysIncludeQuoteId) return true;
			const hiddenAt = hiddenAtMap.get(room.quoteId);
			if (!hiddenAt) return true;
			// 숨긴 뒤 도착한 새 메시지가 있으면 자동으로 다시 노출한다(마지막 메시지 시각이
			// hidden_at보다 뒤). hidden_rooms 행 자체는 지우지 않고 그대로 둔다.
			return room.lastMessageAt !== null && room.lastMessageAt > hiddenAt;
		})
		.sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

export async function getChatContext(
	role: ChatRole,
	alwaysIncludeQuoteId?: string,
): Promise<ChatContext | null> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const rooms = await getChatRooms(role, alwaysIncludeQuoteId);

	return { myId: user.id, myRole: role, rooms };
}
