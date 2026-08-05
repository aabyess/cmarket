"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { ChatRoomHeader } from "@/features/chat/components/ChatRoomHeader";
import { ChatMessageList } from "@/features/chat/components/ChatMessageList";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { postMessage, markMessagesRead, awardAndCreateContract } from "@/features/chat/mutations";
import { createClient } from "@/libs/supabase";
import type { ChatMessage, ChatRoomDetail } from "@/features/chat/types";

type ChatRoomViewProps = {
	room: ChatRoomDetail;
	sellerId: string;
};

export function ChatRoomView({ room, sellerId }: ChatRoomViewProps) {
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessage[]>(room.messages);
	const [input, setInput] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
	const [isAwarding, setIsAwarding] = useState(false);

	useEffect(() => {
		markMessagesRead(room.quoteId);
	}, [room.quoteId]);

	useEffect(() => {
		const supabase = createClient();
	
		const channel = supabase
			.channel(`messages:${room.quoteId}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "messages",
					filter: `quote_id=eq.${room.quoteId}`,
				},
				(payload) => {
					const row = payload.new as {
						id: string;
						sender_id: string;
						content: string;
						is_read: boolean;
						created_at: string;
					};
	
					setMessages((prev) => {
						if (prev.some((m) => m.id === row.id)) return prev;
						return [
							...prev,
							{
								id: row.id,
								senderId: row.sender_id,
								content: row.content,
								isRead: row.is_read,
								createdAt: row.created_at,
							},
						];
					});
				},
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "messages",
					filter: `quote_id=eq.${room.quoteId}`,
				},
				(payload) => {
					const row = payload.new as { id: string; is_read: boolean };
	
					setMessages((prev) =>
						prev.map((m) => (m.id === row.id ? { ...m, isRead: row.is_read } : m)),
					);
				},
			)
			.subscribe();
	
		return () => {
			supabase.removeChannel(channel);
		};
	}, [room.quoteId]);

	async function handleSend() {
		const content = input.trim();
		if (!content || isSending) return;

		setIsSending(true);
		setInput("");
		try {
			await postMessage(room.quoteId, content);
		} catch (err) {
			console.error(err);
			setInput(content);
		} finally {
			setIsSending(false);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	async function handleConfirmAward() {
		setIsAwarding(true);
		try {
			await awardAndCreateContract(room.listingId, room.quoteId, sellerId);
			setIsAwardModalOpen(false);
			router.refresh();
		} catch (err) {
			console.error(err);
		} finally {
			setIsAwarding(false);
		}
	}

	return (
		<div className="flex h-full flex-col">
			<ChatRoomHeader room={room} myRole={room.myRole} onAward={() => setIsAwardModalOpen(true)} />

			<ChatMessageList messages={messages} myId={room.myId} />

			<div className="border-t border-[#E5E7EB] bg-white p-4">
				<div className="flex items-end gap-2">
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="메시지를 입력하세요"
						rows={1}
						className="max-h-32 flex-1 resize-none rounded-xl border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					/>
					<button
						onClick={handleSend}
						disabled={!input.trim() || isSending}
						className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6] text-white transition-colors hover:bg-[#2563EB] disabled:opacity-40"
					>
						<Send size={18} />
					</button>
				</div>
			</div>

			<ConfirmModal
				isOpen={isAwardModalOpen}
				title="이 기업으로 확정할까요?"
				description={`${room.partnerName}을(를) 최종 공급기업으로 확정합니다. 다른 견적은 자동으로 미선정 처리되며, 확정 후에는 변경할 수 없어요.`}
				confirmLabel="확정하기"
				isLoading={isAwarding}
				onConfirm={handleConfirmAward}
				onClose={() => setIsAwardModalOpen(false)}
			/>
		</div>
	);
}