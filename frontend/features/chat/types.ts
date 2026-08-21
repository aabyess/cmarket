import type { Currency } from "@/features/buyer/types";
import type { VerificationStatus } from "@/features/verification/types";

export type ChatRole = "buyer" | "seller";

export type ChatRoom = {
	quoteId: string;
	listingId: string;
	listingTitle: string;
	partnerId: string;
	partnerName: string;
	partnerVerificationStatus: VerificationStatus;
	price: number;
	currency: Currency;
	deliveryDays: number;
	quoteStatus: "pending" | "awarded" | "rejected";
	hasContract: boolean;
	lastMessage: string;
	lastMessageAt: string | null;
	unreadCount: number;
};

export type ChatMessageType = "text" | "quote_pdf" | "invoice_pdf" | "image";

export type ChatMessage = {
	id: string;
	senderId: string;
	content: string;
	isRead: boolean;
	createdAt: string;
	sourceLang: string | null;
	translations: Record<string, string> | null;
	messageType: ChatMessageType;
	attachmentUrl: string | null;
	attachmentName: string | null;
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