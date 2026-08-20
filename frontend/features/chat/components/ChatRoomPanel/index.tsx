"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowUp, ChevronLeft, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessageList } from "@/features/chat/components/ChatMessageList";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useMessages, CHAT_QUERY_KEYS } from "@/features/chat/queries";
import { getMessages, mapMessageRow, MESSAGE_PAGE_SIZE, type MessageRow } from "@/features/chat/apis";
import { useSendMessage, markMessagesRead, awardAndCreateContract } from "@/features/chat/mutations";
import { markNotificationsByQuoteRead } from "@/features/notifications/apis";
import { NOTIFICATION_QUERY_KEYS } from "@/features/notifications/queries";
import { createClient } from "@/libs/supabase";
import type { ChatMessage, ChatRole, ChatRoom } from "@/features/chat/types";

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
	const [limitExceeded, setLimitExceeded] = useState(false);
	const [isLoadingOlder, setIsLoadingOlder] = useState(false);
	const [reachedOldest, setReachedOldest] = useState(false);
	const [hasOlderInitial, setHasOlderInitial] = useState<boolean | null>(null);

	// "더 오래된 페이지가 있는지"는 최초 로드 결과로 한 번만 판단한다.
	// 캐시 배열 길이로 매번 재계산하면 실시간 INSERT로 길이가 늘어난 것만으로
	// 이전 페이지가 없는 방에도 버튼이 잘못 뜬다.
	useEffect(() => {
		if (!isLoading && hasOlderInitial === null) {
			setHasOlderInitial(messages.length >= MESSAGE_PAGE_SIZE);
		}
	}, [isLoading, hasOlderInitial, messages.length]);

	const hasOlderMessages = (hasOlderInitial ?? false) && !reachedOldest;

	async function handleLoadOlder(): Promise<void> {
		const oldest = messages[0];
		if (!oldest || isLoadingOlder) return;

		setIsLoadingOlder(true);
		try {
			const older = await getMessages(room.quoteId, { before: oldest.createdAt });
			if (older.length < MESSAGE_PAGE_SIZE) setReachedOldest(true);
			if (older.length > 0) {
				queryClient.setQueryData<ChatMessage[]>(CHAT_QUERY_KEYS.messages(room.quoteId), (prev) => {
					if (!prev) return older;
					const known = new Set(prev.map((m) => m.id));
					return [...older.filter((m) => !known.has(m.id)), ...prev];
				});
			}
		} finally {
			setIsLoadingOlder(false);
		}
	}

	useEffect(() => {
		markMessagesRead(room.quoteId);
		// 알림을 읽음 처리한 뒤 캐시를 무효화해야 벨의 빨간 점이 바로 사라진다.
		markNotificationsByQuoteRead(room.quoteId).then(() => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
		});
	}, [room.quoteId, queryClient]);

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
					// 이벤트마다 전체 이력을 다시 내려받으면 읽음 처리(행당 UPDATE 1건)만으로도
					// refetch가 폭주한다. 페이로드를 캐시에 직접 반영한다.
					if (payload.eventType === "INSERT") {
						const incoming = mapMessageRow(payload.new as MessageRow);
						queryClient.setQueryData<ChatMessage[]>(queryKey, (prev) => {
							if (!prev) return prev;
							if (prev.some((m) => m.id === incoming.id)) return prev;

							// 낙관적으로 넣어둔 임시(temp-) 메시지가 실제 행으로 도착하면 교체한다.
							const tempIndex = prev.findIndex(
								(m) =>
									m.id.startsWith("temp-") &&
									m.senderId === incoming.senderId &&
									m.content === incoming.content,
							);
							const base = tempIndex >= 0 ? prev.filter((_, i) => i !== tempIndex) : prev;

							// 이벤트 도착 순서가 created_at 순서와 다를 수 있으므로 항상 시간순으로 유지한다.
							return [...base, incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
						});

						if (incoming.senderId !== myId) {
							markMessagesRead(room.quoteId);
						}
						return;
					}

					if (payload.eventType === "UPDATE") {
						const updated = mapMessageRow(payload.new as MessageRow);
						queryClient.setQueryData<ChatMessage[]>(queryKey, (prev) =>
							prev?.map((m) => (m.id === updated.id ? updated : m)),
						);
						return;
					}

					queryClient.invalidateQueries({ queryKey });
				},
			)
			.subscribe((status) => {
				// 구독 완료 전에 도착한 메시지는 이벤트로 오지 않으므로 연결 시점에 한 번 동기화한다.
				if (status === "SUBSCRIBED") {
					queryClient.invalidateQueries({ queryKey });
				}
			});

		return () => {
			supabase.removeChannel(channel);
		};
	}, [room.quoteId, queryClient, myId]);

	function handleSend(): void {
		const content = input.trim();
		if (!content) return;
		setInput("");
		sendMessage(content, {
			onSuccess: (result) => {
				if (result.limitExceeded) setLimitExceeded(true);
			},
		});
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
					aria-label={t("backToListAria")}
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
				<ChatMessageList
				messages={messages}
				myId={myId}
				quoteId={room.quoteId}
				hasOlder={hasOlderMessages}
				isLoadingOlder={isLoadingOlder}
				onLoadOlder={handleLoadOlder}
			/>
			)}

			{/* 무료 요금제 번역 한도 안내 */}
			{limitExceeded && (
				<div className="flex items-center justify-center gap-2 border-t border-[#E5E7EB]/60 bg-amber-50 px-4 py-2 text-xs text-amber-700">
					<Sparkles size={14} className="shrink-0" />
					<span>{t("limitExceededBanner")}</span>
					<Link href="/plans" className="font-semibold underline underline-offset-2">
						{t("limitExceededBannerLink")}
					</Link>
				</div>
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