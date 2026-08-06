export type NotificationType = "message";

export type Notification = {
	id: string;
	type: NotificationType;
	quoteId: string;
	title: string;
	content: string;
	isRead: boolean;
	createdAt: string;
};