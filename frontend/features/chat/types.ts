export type ChatMessageType = "text" | "document" | "system";

export type ChatMessage = {
	id: string;
	roomId: string;
	isMine: boolean;
	type: ChatMessageType;
	content: string;
	fileName: string | null;
	fileSize: string | null;
	timeText: string;
	isRead: boolean;
};

export type ChatRoom = {
	id: string;
	contractId: string;
	partnerName: string;
	contractTitle: string;
	lastMessage: string;
	lastTimeText: string;
	unreadCount: number;
	isOnline: boolean;
};