"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
	onBack: () => void;
};

export function ChatRoomPanel({ room, myId, myRole, onBack }: ChatRoomPanelProps): React.ReactNode {
	const t = useTranslations("ChatRoomPanel");
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
				<button
					onClick={onBack}
					aria-label="목록으로 돌아가기"
					className="flex size-9 items-center justify-center rounded-full text-imsg-blue transition-colors hover:bg-imsg-surface"
				>
					<ChevronLeft className="size-6" strokeWidth={2.5} />
				</button>
				<div className="flex flex-col items-center">
					<span className="text-base font-semibold leading-tight text-foreground">
						{room.partnerName}
					</span>
					<span className="text-xs text-imsg-secondary">{room.listingTitle}</span>
				</div>
				{myRole === "buyer" ? (
					room.quoteStatus === "awarded" ? (
						<span className="rounded-full bg-imsg-blue/10 px-3 py-1.5 text-xs font-semibold text-imsg-blue">
							{t("statusAwarded")}
						</span>
					) : room.quoteStatus === "rejected" ? (
						<span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-semibold text-[#9CA3AF]">
							{t("statusRejected")}
						</span>
					) : (
						<button
							onClick={() => setIsAwardModalOpen(true)}
							className="rounded-full bg-imsg-blue px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
						>
							{t("awardButton")}
						</button>
					)
				) : (
					<div className="size-9" />
				)}
			</header>

			{/* 견적 정보 */}
			<div className="flex justify-center gap-2 border-b border-[#E5E7EB]/60 bg-white/60 px-4 py-2 backdrop-blur-xl">
				<span className="flex items-center gap-1 rounded-full bg-imsg-surface px-3 py-1 text-xs text-imsg-secondary">
					{t("quotePriceLabel")} <span className="font-semibold text-foreground">
						{room.currency} {room.price.toLocaleString()}
					</span>
				</span>
				<span className="flex items-center gap-1 rounded-full bg-imsg-surface px-3 py-1 text-xs text-imsg-secondary">
					{t("deliveryLabel")} <span className="font-semibold text-foreground">{t("deliveryDays", { days: room.deliveryDays })}</span>
				</span>
			</div>

			{/* 메시지 */}
			{isLoading ? (
				<div className="flex-1 bg-imsg-surface" />
			) : (
				<ChatMessageList messages={messages} myId={myId} quoteId={room.quoteId} />
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
							placeholder={t("messagePlaceholder")}
							rows={1}
							className="max-h-32 w-full resize-none bg-transparent text-sm outline-none placeholder:text-imsg-secondary"
						/>
					</div>
					<button
						onClick={handleSend}
						disabled={!input.trim()}
						className="flex size-9 shrink-0 items-center justify-center rounded-full bg-imsg-blue text-white transition-all active:scale-90 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]"
					>
						<ArrowUp className="size-5" strokeWidth={2.5} />
					</button>
				</div>
			</div>

			<ConfirmModal
				isOpen={isAwardModalOpen}
				title={t("awardModalTitle")}
				description={t("awardModalDescription", { partnerName: room.partnerName })}
				confirmLabel={t("awardModalConfirm")}
				isLoading={isAwarding}
				onConfirm={handleConfirmAward}
				onClose={() => setIsAwardModalOpen(false)}
			/>
		</section>
	);
}