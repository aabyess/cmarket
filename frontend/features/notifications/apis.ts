import { createClient } from "@/libs/supabase";
import type { Notification } from "@/features/notifications/types";

export async function getNotifications(): Promise<Notification[]> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return [];

	const { data, error } = await supabase
		.from("notifications")
		.select("id, type, quote_id, title, content, is_read, created_at")
		.eq("profile_id", user.id)
		.order("created_at", { ascending: false })
		.limit(20);

	if (error) throw error;

	return (data ?? []).map((row) => ({
		id: row.id,
		type: row.type as Notification["type"],
		quoteId: row.quote_id,
		title: row.title,
		content: row.content,
		isRead: row.is_read,
		createdAt: row.created_at,
	}));
}

export async function markNotificationRead(id: string): Promise<void> {
	const supabase = createClient();
	await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

export async function markAllNotificationsRead(): Promise<void> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;

	await supabase
		.from("notifications")
		.update({ is_read: true })
		.eq("profile_id", user.id)
		.eq("is_read", false);
}

export async function markNotificationsByQuoteRead(quoteId: string): Promise<void> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return;

	await supabase
		.from("notifications")
		.update({ is_read: true })
		.eq("quote_id", quoteId)
		.eq("profile_id", user.id)
		.eq("is_read", false);
}

export async function deleteNotification(id: string): Promise<void> {
	const supabase = createClient();
	await supabase.from("notifications").delete().eq("id", id);
}