"use client";

import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ChatRoom } from "@/features/chat/types";

function formatTime(iso: string | null): string {
	if (!iso) return "";
	const date = new Date(iso);
	const now = new Date();
	const isToday = date.toDateString() === now.toDateString();

	if (isToday) {
		return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
	}
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

type ChatRoomListProps = {
	rooms: ChatRoom[];
	basePath: string;
	activeQuoteId?: string;
};

export function ChatRoomList({ rooms, basePath, activeQuoteId }: ChatRoomListProps) {
	const router = useRouter();

	if (rooms.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center p-8 text-center">
				<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#F3F4F6]">
					<MessageSquare size={22} className="text-[#9CA3AF]" />
				</div>
				<p className="text-sm font-medium text-[#1F2937]">대화가 없어요</p>
				<p className="mt-1 text-xs text-[#6B7280]">
					견적을 주고받으면 여기에서 대화할 수 있어요.
				</p>
			</div>
		);
	}

	return (
		<div className="divide-y divide-[#F3F4F6]">
			{rooms.map((room) => (
				<button
					key={room.quoteId}
					onClick={() => router.push(`${basePath}/${room.quoteId}`)}
					className={cn(
						"flex w-full gap-3 p-4 text-left transition-colors",
						activeQuoteId === room.quoteId ? "bg-[#EFF6FF]" : "hover:bg-[#F9FAFB]",
					)}
				>
					<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 text-xs font-bold text-white">
						{room.partnerName.slice(0, 2)}
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex items-baseline justify-between gap-2">
							<p className="truncate text-[14px] font-medium text-[#1F2937]">
								{room.partnerName}
							</p>
							<span className="shrink-0 text-[11px] text-[#9CA3AF]">
								{formatTime(room.lastMessageAt)}
							</span>
						</div>
						<p className="truncate text-xs text-[#6B7280]">{room.listingTitle}</p>
						<div className="mt-0.5 flex items-center justify-between gap-2">
							<p className="truncate text-[13px] text-[#9CA3AF]">{room.lastMessage}</p>
							{room.unreadCount > 0 && (
								<span className="shrink-0 rounded-full bg-[#EF4444] px-1.5 py-px text-[10px] text-white">
									{room.unreadCount}
								</span>
							)}
						</div>
					</div>
				</button>
			))}
		</div>
	);
}