import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { ChatRole, ChatRoom, ChatRoomDetail } from "@/features/chat/types";

type QuoteRow = {
	id: string;
	listing_id: string;
	seller_id: string;
	price: number;
	currency: string;
	delivery_days: number;
	status: "pending" | "awarded" | "rejected";
	listings: { title: string; user_id: string } | null;
};

export async function getChatRooms(role: ChatRole): Promise<ChatRoom[]> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	let quoteIds: string[] = [];

	if (role === "seller") {
		const { data } = await supabase.from("quotes").select("id").eq("seller_id", user.id);
		quoteIds = (data ?? []).map((row) => row.id);
	} else {
		const { data: listings } = await supabase
			.from("listings")
			.select("id")
			.eq("user_id", user.id);
		const listingIds = (listings ?? []).map((row) => row.id);
		if (listingIds.length === 0) return [];

		const { data } = await supabase.from("quotes").select("id").in("listing_id", listingIds);
		quoteIds = (data ?? []).map((row) => row.id);
	}

	if (quoteIds.length === 0) return [];

	const { data: messages } = await supabase
		.from("messages")
		.select("quote_id, content, created_at, sender_id, is_read")
		.in("quote_id", quoteIds)
		.order("created_at", { ascending: false });

	const activeQuoteIds = [...new Set((messages ?? []).map((m) => m.quote_id))];
	if (activeQuoteIds.length === 0) return [];

	const { data: quotes } = await supabase
		.from("quotes")
		.select("id, listing_id, seller_id, price, currency, delivery_days, status, listings(title, user_id)")
		.in("id", activeQuoteIds);

	const quoteRows = (quotes ?? []) as unknown as QuoteRow[];

	const partnerIds = [
		...new Set(
			quoteRows
				.map((q) => (role === "seller" ? q.listings?.user_id : q.seller_id))
				.filter((id): id is string => Boolean(id)),
		),
	];

	const { data: companies } = await supabase
		.from("companies")
		.select("profile_id, company_name")
		.in("profile_id", partnerIds);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c.company_name]));

	const { data: contracts } = await supabase
		.from("contracts")
		.select("quote_id")
		.in("quote_id", activeQuoteIds);

	const contractSet = new Set((contracts ?? []).map((c) => c.quote_id));

	return quoteRows
		.map((quote) => {
			const roomMessages = (messages ?? []).filter((m) => m.quote_id === quote.id);
			const latest = roomMessages[0];
			const partnerId = role === "seller" ? (quote.listings?.user_id ?? "") : quote.seller_id;

			return {
				quoteId: quote.id,
				listingId: quote.listing_id,
				listingTitle: quote.listings?.title ?? "",
				partnerName: companyMap.get(partnerId) ?? "",
				price: Number(quote.price),
				currency: quote.currency as ChatRoom["currency"],
				deliveryDays: quote.delivery_days,
				quoteStatus: quote.status,
				hasContract: contractSet.has(quote.id),
				lastMessage: latest?.content ?? "",
				lastMessageAt: latest?.created_at ?? null,
				unreadCount: roomMessages.filter((m) => !m.is_read && m.sender_id !== user.id).length,
			};
		})
		.sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

export async function getChatRoomDetail(quoteId: string): Promise<ChatRoomDetail | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;

	const [quoteResult, messagesResult] = await Promise.all([
		supabase
			.from("quotes")
			.select(
				"id, listing_id, seller_id, price, currency, delivery_days, status, listings(title, user_id), contracts(id)",
			)
			.eq("id", quoteId)
			.single(),
		supabase
			.from("messages")
			.select("id, sender_id, content, is_read, created_at")
			.eq("quote_id", quoteId)
			.order("created_at", { ascending: true }),
	]);

	if (!quoteResult.data) return null;

	const quoteRow = quoteResult.data as unknown as QuoteRow & {
		contracts: { id: string }[] | null;
	};

	const buyerId = quoteRow.listings?.user_id ?? "";
	const myRole: ChatRole = user.id === quoteRow.seller_id ? "seller" : "buyer";
	const partnerId = myRole === "seller" ? buyerId : quoteRow.seller_id;

	const { data: company } = await supabase
		.from("companies")
		.select("company_name")
		.eq("profile_id", partnerId)
		.single();

	const messageList = messagesResult.data ?? [];
	const latest = messageList[messageList.length - 1];

	return {
		quoteId: quoteRow.id,
		listingId: quoteRow.listing_id,
		listingTitle: quoteRow.listings?.title ?? "",
		partnerName: company?.company_name ?? "",
		price: Number(quoteRow.price),
		currency: quoteRow.currency as ChatRoomDetail["currency"],
		deliveryDays: quoteRow.delivery_days,
		quoteStatus: quoteRow.status,
		hasContract: (quoteRow.contracts?.length ?? 0) > 0,
		lastMessage: latest?.content ?? "",
		lastMessageAt: latest?.created_at ?? null,
		unreadCount: 0,
		myId: user.id,
		myRole,
		messages: messageList.map((m) => ({
			id: m.id,
			senderId: m.sender_id,
			content: m.content,
			isRead: m.is_read,
			createdAt: m.created_at,
		})),
	};
}

export async function getQuoteSellerId(quoteId: string): Promise<string | null> {
	const supabase = await createServerSupabaseClient();

	const { data } = await supabase
		.from("quotes")
		.select("seller_id")
		.eq("id", quoteId)
		.single();

	return data?.seller_id ?? null;
}