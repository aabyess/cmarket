import type { Currency } from "@/features/buyer/types";

export type ChatRole = "buyer" | "seller";

export type ChatRoom = {
	quoteId: string;
	listingId: string;
	listingTitle: string;
	partnerId: string;
	partnerName: string;
	price: number;
	currency: Currency;
	deliveryDays: number;
	quoteStatus: "pending" | "awarded" | "rejected";
	hasContract: boolean;
	lastMessage: string;
	lastMessageAt: string | null;
	unreadCount: number;
};

export type ChatMessage = {
	id: string;
	senderId: string;
	content: string;
	isRead: boolean;
	createdAt: string;
};

export type ChatRoomDetail = ChatRoom & {
	myId: string;
	myRole: ChatRole;
	messages: ChatMessage[];
};

export type ChatContext = {
	myId: string;
	myRole: ChatRole;
	rooms: ChatRoom[];
};