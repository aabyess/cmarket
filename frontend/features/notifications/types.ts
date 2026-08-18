export type NotificationType = "message" | "quote";

export type Notification = {
	id: string;
	type: NotificationType;
	quoteId: string;
	title: string;
	titleSourceLang: string | null;
	titleTranslations: Record<string, string> | null;
	content: string;
	contentSourceLang: string | null;
	contentTranslations: Record<string, string> | null;
	isRead: boolean;
	createdAt: string;
};