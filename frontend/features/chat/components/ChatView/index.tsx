"use client";

import { useRouter } from "next/navigation";
import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { ChatRoom } from "@/features/chat/components/ChatRoom";
import { MOCK_CHAT_ROOMS, MOCK_CHAT_MESSAGES } from "@/features/chat/mocks";
import type { ChatMessage, ChatRoom as ChatRoomType } from "@/features/chat/types";

type ChatViewProps = {
	activeContractId: string | null;
};

export function ChatView({ activeContractId }: ChatViewProps) {
	const router = useRouter();

	const activeRoom =
		MOCK_CHAT_ROOMS.find((room) => room.contractId === activeContractId) ?? null;
	const messages = activeRoom
		? MOCK_CHAT_MESSAGES.filter((message) => message.roomId === activeRoom.id)
		: [];

	function handleSelectRoom(room: ChatRoomType) {
		router.push(`/buyer/chat/${room.contractId}`);
	}

	function handleSend(content: string) {
		console.log("send", content);
	}

	function handleAttach() {
		console.log("attach");
	}

	function handleViewDocuments() {
		if (!activeRoom) return;
		router.push(`/buyer/contract/${activeRoom.contractId}`);
	}

	function handleOpenDocument(message: ChatMessage) {
		console.log("open document", message.fileName);
	}

	return (
		<div className="grid h-[calc(100vh-9rem)] grid-cols-[340px_minmax(0,1fr)] gap-4">
			<ChatRoomList
				rooms={MOCK_CHAT_ROOMS}
				activeRoomId={activeRoom?.id ?? null}
				onSelectRoom={handleSelectRoom}
			/>
			<ChatRoom
				room={activeRoom}
				messages={messages}
				onSend={handleSend}
				onAttach={handleAttach}
				onViewDocuments={handleViewDocuments}
				onOpenDocument={handleOpenDocument}
			/>
		</div>
	);
}