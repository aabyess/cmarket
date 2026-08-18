import { getLocale } from "next-intl/server";
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
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];
	const locale = await getLocale();

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
				lastMessage: latest?.content ?? "",
				lastMessageAt: latest?.created_at ?? null,
				unreadCount: roomMessages.filter((m) => !m.is_read && m.sender_id !== user.id).length,
			};
		})
		.sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

export async function getChatContext(role: ChatRole): Promise<ChatContext | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;

	const rooms = await getChatRooms(role);

	return { myId: user.id, myRole: role, rooms };
}