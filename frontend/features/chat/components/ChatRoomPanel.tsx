"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ChevronLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessageList } from "@/features/chat/components/ChatMessageList";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useMessages, CHAT_QUERY_KEYS } from "@/features/chat/queries";
import { useSendMessage, markMessagesRead, awardAndCreateContract } from "@/features/chat/mutations";
import { markNotificationsByQuoteRead } from "@/features/notifications/apis";
import { createClient } from "@/libs/supabase";
import type { ChatRole, ChatRoom } from "@/features/chat/types";

type ChatRoomPanelProps = {
	room: ChatRoom;
	myId: string;
	myRole: ChatRole;
};

export function ChatRoomPanel({ room, myId, myRole }: ChatRoomPanelProps): React.ReactNode {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: messages = [], isLoading } = useMessages(room.quoteId);
	const { mutate: sendMessage } = useSendMessage(room.quoteId, myId);

	const [input, setInput] = useState("");
	const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
	const [isAwarding, setIsAwarding] = useState(false);

	useEffect(() => {
		markMessagesRead(room.quoteId);
		markNotificationsByQuoteRead(room.quoteId);
	}, [room.quoteId]);

	useEffect(() => {
		const supabase = createClient();
		const queryKey = CHAT_QUERY_KEYS.messages(room.quoteId);

		const channel = supabase
			.channel(`messages:${room.quoteId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "messages",
					filter: `quote_id=eq.${room.quoteId}`,
				},
				(payload) => {
					queryClient.invalidateQueries({ queryKey });

					if (
						payload.eventType === "INSERT" &&
						(payload.new as { sender_id: string }).sender_id !== myId
					) {
						markMessagesRead(room.quoteId);
					}
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [room.quoteId, queryClient, myId]);

	function handleSend(): void {
		const content = input.trim();
		if (!content) return;
		setInput("");
		sendMessage(content);
	}

	async function handleConfirmAward(): Promise<void> {
		setIsAwarding(true);
		try {
			await awardAndCreateContract(room.listingId, room.quoteId, room.partnerId);
			setIsAwardModalOpen(false);
			router.refresh();
		} catch (err) {
			console.error(err);
		} finally {
			setIsAwarding(false);
		}
	}

	return (
		<section className="flex min-h-0 flex-1 flex-col bg-imsg-surface">
			{/* 헤더 */}
			<header className="flex items-center justify-between border-b border-[#E5E7EB]/60 bg-white/80 px-4 py-2.5 backdrop-blur-xl">
				<button className="flex size-9 items-center justify-center rounded-full text-imsg-blue transition-colors hover:bg-imsg-surface">
					<ChevronLeft className="size-6" strokeWidth={2.5} />
				</button>
				<div className="flex flex-col items-center">
					<span className="text-[17px] font-semibold leading-tight text-[#0f172a]">
						{room.partnerName}
					</span>
					<span className="text-[11px] text-imsg-secondary">{room.listingTitle}</span>
				</div>
				{myRole === "buyer" ? (
					<button
						onClick={() => setIsAwardModalOpen(true)}
						className="rounded-full bg-imsg-blue px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-600"
					>
						확정
					</button>
				) : (
					<div className="size-9" />
				)}
			</header>

			{/* 견적 정보 */}
			<div className="flex justify-center gap-6 border-b border-[#E5E7EB]/60 bg-white/60 px-4 py-2 backdrop-blur-xl">
				<span className="text-[12px] text-imsg-secondary">
					견적가 <span className="font-semibold text-[#0f172a]">
						{room.currency} {room.price.toLocaleString()}
					</span>
				</span>
				<span className="text-[12px] text-imsg-secondary">
					납품 <span className="font-semibold text-[#0f172a]">{room.deliveryDays}일</span>
				</span>
			</div>

			{/* 메시지 */}
			{isLoading ? (
				<div className="flex-1 bg-imsg-surface" />
			) : (
				<ChatMessageList messages={messages} myId={myId} />
			)}

			{/* 입력창 */}
			<div className="border-t border-[#E5E7EB]/60 bg-white/80 px-4 py-3 backdrop-blur-xl">
				<div className="mx-auto flex max-w-2xl items-center gap-2">
					<div className="flex flex-1 items-center rounded-full bg-imsg-surface px-4 py-2.5">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
									e.preventDefault();
									handleSend();
								}
							}}
							placeholder="메시지를 입력하세요"
							rows={1}
							className="max-h-32 w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-imsg-secondary"
						/>
					</div>
					{input.trim() && (
						<button
							onClick={handleSend}
							className="flex size-9 shrink-0 items-center justify-center rounded-full bg-imsg-blue text-white transition-transform active:scale-90"
						>
							<ArrowUp className="size-5" strokeWidth={2.5} />
						</button>
					)}
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
		</section>
	);
}