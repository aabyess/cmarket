"use client";

import { MessageSquare } from "lucide-react";
import { ChatRoomHeader } from "@/features/chat/components/ChatRoom/ChatRoomHeader";
import { ChatRoomMessage } from "@/features/chat/components/ChatRoom/ChatRoomMessage";
import { ChatRoomInput } from "@/features/chat/components/ChatRoom/ChatRoomInput";
import type { ChatMessage, ChatRoom as ChatRoomType } from "@/features/chat/types";

type ChatRoomProps = {
	room: ChatRoomType | null;
	messages: ChatMessage[];
	onSend: (content: string) => void;
	onAttach: () => void;
	onViewDocuments: () => void;
	onOpenDocument: (message: ChatMessage) => void;
};

export function ChatRoom({
	room,
	messages,
	onSend,
	onAttach,
	onViewDocuments,
	onOpenDocument,
}: ChatRoomProps) {
	if (!room) {
		return (
			<div className="flex h-full flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">
				<MessageSquare size={32} className="text-[#D1D5DB]" />
				<p className="mt-3 text-sm text-[#6B7280]">대화를 선택해주세요</p>
				<p className="mt-0.5 text-xs text-[#9CA3AF]">
					계약이 시작되면 공급기업과 대화할 수 있어요
				</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white">
			<ChatRoomHeader room={room} onViewDocuments={onViewDocuments} />

			<div className="flex-1 overflow-y-auto bg-[#F9FAFB] px-4 py-3">
				{messages.map((message) => (
					<ChatRoomMessage
						key={message.id}
						message={message}
						onOpenDocument={onOpenDocument}
					/>
				))}
			</div>

			<ChatRoomInput onSend={onSend} onAttach={onAttach} />
		</div>
	);
}