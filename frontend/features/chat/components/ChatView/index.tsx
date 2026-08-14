"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { ChatRoomPanel } from "@/features/chat/components/ChatRoomPanel";
import type { ChatContext, ChatRoom } from "@/features/chat/types";

type ChatViewProps = {
	context: ChatContext;
	initialQuoteId?: string;
};

export function ChatView({ context, initialQuoteId }: ChatViewProps): React.ReactNode {
	const [activeQuoteId, setActiveQuoteId] = useState<string | null>(initialQuoteId ?? null);
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
		<div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-white">
			<div className="flex h-full w-[300px] shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB]/60">
				<ChatRoomList
					rooms={rooms}
					activeQuoteId={activeQuoteId ?? undefined}
					onSelect={handleSelect}
				/>
			</div>

			<div className="flex h-full flex-1 flex-col overflow-hidden">
				{activeRoom ? (
					<ChatRoomPanel
						key={activeRoom.quoteId}
						room={activeRoom}
						myId={context.myId}
						myRole={context.myRole}
						onBack={() => setActiveQuoteId(null)}
					/>
				) : (
					<div className="flex h-full flex-col items-center justify-center bg-white">
						<div className="mb-3 flex size-14 items-center justify-center rounded-full bg-imsg-surface">
							<MessageSquare size={26} className="text-[#9CA3AF]" />
						</div>
						<p className="text-sm font-medium text-[#1F2937]">대화를 선택하세요</p>
						<p className="mt-1 text-sm text-imsg-secondary">
							왼쪽 목록에서 선택하면 대화를 시작할 수 있어요.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}