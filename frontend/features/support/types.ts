export type Notice = {
	id: string;
	title: string;
	content: string;
	isPinned: boolean;
	publishedAt: string | null;
	viewCount: number;
	createdAt: string;
};

export type SupportResource = {
	id: string;
	title: string;
	description: string;
	fileName: string;
	storagePath: string;
	fileSize: number;
	downloadCount: number;
	publishedAt: string | null;
	createdAt: string;
};

export type InquiryCategory = "ACCOUNT" | "LISTING" | "QUOTE" | "CONTRACT" | "PAYMENT" | "ETC";

export type InquiryStatus = "OPEN" | "ANSWERED" | "CLOSED";

export type InquiryReply = {
	id: string;
	content: string;
	isStaff: boolean;
	createdAt: string;
};

export type Inquiry = {
	id: string;
	category: InquiryCategory;
	title: string;
	content: string;
	status: InquiryStatus;
	answeredAt: string | null;
	createdAt: string;
	authorName: string;
	authorCompanyName: string;
	replies: InquiryReply[];
};

export type FaqItem = {
	id: string;
	category: FaqCategory;
	question: string;
	answer: string[];
};

export type FaqCategory = "ACCOUNT" | "LISTING" | "QUOTE" | "CONTRACT" | "PAYMENT";
