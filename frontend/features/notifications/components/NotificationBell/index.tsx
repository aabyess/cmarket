"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Mail, MessageSquare, X } from "lucide-react";
import { useNotifications, NOTIFICATION_QUERY_KEYS } from "@/features/notifications/queries";
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from "@/features/notifications/apis";
import { createClient } from "@/libs/supabase";
import { cn } from "@/utils/cn";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import type { Notification } from "@/features/notifications/types";

function formatTime(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const isToday = date.toDateString() === now.toDateString();

	if (isToday) {
		return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
	}
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function NotificationBell(): React.ReactNode {
	const t = useTranslations("NotificationBell");
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const { data: notifications = [] } = useNotifications();
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const unreadCount = notifications.filter((n) => !n.isRead).length;
	const chatBasePath = pathname.startsWith("/seller") ? "/seller/chat" : "/buyer/chat";

	useEffect(() => {
		function handleClickOutside(e: MouseEvent): void {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		if (isOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	useEffect(() => {
		const supabase = createClient();
		let isCancelled = false;
		let channel: ReturnType<typeof supabase.channel> | null = null;

		supabase.auth.getUser().then(({ data: { user } }) => {
			if (!user || isCancelled) return;

			channel = supabase
				.channel(`notifications:${user.id}`)
				.on(
					"postgres_changes",
					{
						event: "INSERT",
						schema: "public",
						table: "notifications",
						filter: `profile_id=eq.${user.id}`,
					},
					() => {
						queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
					},
				)
				.subscribe();
		});

		return () => {
			isCancelled = true;
			if (channel) supabase.removeChannel(channel);
		};
	}, [queryClient]);

	async function handleNotificationClick(notification: Notification): Promise<void> {
		await markNotificationRead(notification.id);
		queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
		setIsOpen(false);

		// 견적 도착은 채팅이 아니라 받은 견적 화면으로 보낸다.
		if (notification.type === "quote") {
			router.push("/buyer/quote-review");
			return;
		}

		// 계약 확정은 계약 페이지로 보낸다.
		if (notification.type === "award") {
			router.push(pathname.startsWith("/seller") ? "/seller/contract" : "/buyer/contract");
			return;
		}

		// quote_id가 없는 옛 알림은 특정 방으로 못 보내므로 채팅 목록으로 보낸다.
		if (!notification.quoteId) {
			router.push(chatBasePath);
			return;
		}

		router.push(`${chatBasePath}?quoteId=${notification.quoteId}`);
	}

	async function handleMarkAllRead(): Promise<void> {
		await markAllNotificationsRead();
		queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
	}

	async function handleDelete(e: React.MouseEvent, id: string): Promise<void> {
		e.stopPropagation();
		await deleteNotification(id);
		queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
	}

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground outline-none hover:bg-black/5 hover:text-[#1F2937] transition-colors"			>
				<Bell size={16} />
				{unreadCount > 0 && (
					<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
				)}
			</button>

			{isOpen && (
				<div className="absolute left-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden z-50">
					<div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
						<p className="text-sm font-semibold text-[#1F2937]">{t("title")}</p>
						{unreadCount > 0 && (
							<button onClick={handleMarkAllRead} className="text-xs text-imsg-blue hover:underline">
								{t("markAllRead")}
							</button>
						)}
					</div>

					<div className="max-h-96 overflow-y-auto">
						{notifications.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-10 text-center">
								<MessageSquare size={24} className="mb-2 text-[#D1D5DB]" />
								<p className="text-sm text-[#9CA3AF]">{t("emptyText")}</p>
							</div>
						) : (
							notifications.map((n) => {
								const title = resolveTranslatedField(n.title, n.titleSourceLang, n.titleTranslations, locale);
								const content = resolveTranslatedField(
									n.content,
									n.contentSourceLang,
									n.contentTranslations,
									locale,
								);

								return (
									<div
										key={n.id}
										className={cn(
											"group flex items-start gap-2 px-4 py-3 transition-colors hover:bg-gray-50",
											!n.isRead && "bg-[#EFF6FF]",
										)}
									>
										<span
											className={cn(
												"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
												n.type === "quote" ? "bg-[#EFF6FF]" : "bg-[#F3F4F6]",
											)}
										>
											{n.type === "quote" ? (
												<Mail size={12} className="text-imsg-blue" />
											) : (
												<MessageSquare size={12} className="text-[#6B7280]" />
											)}
										</span>

										<button
											onClick={() => handleNotificationClick(n)}
											className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
										>
											<div className="flex items-center justify-between gap-2">
												<p className="truncate text-sm font-medium text-[#1F2937]">{title}</p>
												<span className="shrink-0 text-xs text-[#9CA3AF]">
													{formatTime(n.createdAt)}
												</span>
											</div>
											<p className="truncate text-xs text-[#6B7280]">{content}</p>
										</button>

										<button
											onClick={(e) => handleDelete(e, n.id)}
											aria-label={t("deleteAriaLabel")}
											className="mt-0.5 shrink-0 text-[#D1D5DB] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-[#9CA3AF]"
										>
											<X size={14} />
										</button>
									</div>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}