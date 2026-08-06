"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { ChatRoomPanel } from "@/features/chat/components/ChatRoomPanel";
import type { ChatContext, ChatRoom } from "@/features/chat/types";

type ChatViewProps = {
	context: ChatContext;
};

export function ChatView({ context }: ChatViewProps) {
	const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
	const [rooms, setRooms] = useState<ChatRoom[]>(context.rooms);

	const activeRoom = rooms.find((room) => room.quoteId === activeQuoteId) ?? null;

	function handleSelect(quoteId: string): void {
		setActiveQuoteId(quoteId);
		setRooms((prev) =>
			prev.map((room) =>
				room.quoteId === quoteId ? { ...room, unreadCount: 0 } : room,
			),
		);
	}

	return (
		<div className="flex h-[calc(100vh-4rem)]">
			<aside className="w-80 shrink-0 overflow-y-auto border-r border-[#E5E7EB] bg-white">
				<div className="border-b border-[#E5E7EB] px-5 py-4">
					<h1 className="text-lg font-bold text-[#1F2937]">채팅</h1>
					<p className="text-xs text-[#6B7280]">대화 {rooms.length}건</p>
				</div>
				<ChatRoomList
					rooms={rooms}
					activeQuoteId={activeQuoteId ?? undefined}
					onSelect={handleSelect}
				/>
			</aside>

			<div className="min-w-0 flex-1">
				{activeRoom ? (
					<ChatRoomPanel
						key={activeRoom.quoteId}
						room={activeRoom}
						myId={context.myId}
						myRole={context.myRole}
					/>
				) : (
					<div className="flex h-full flex-col items-center justify-center bg-[#F0F5FF]">
						<div className="mb-3 flex size-14 items-center justify-center rounded-full bg-white">
							<MessageSquare size={26} className="text-[#9CA3AF]" />
						</div>
						<p className="text-[15px] font-medium text-[#1F2937]">대화를 선택하세요</p>
						<p className="mt-1 text-sm text-[#6B7280]">
							왼쪽 목록에서 선택하면 대화를 시작할 수 있어요.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}