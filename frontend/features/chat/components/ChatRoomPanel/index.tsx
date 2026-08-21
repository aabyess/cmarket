"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
	ArrowUp,
	Banknote,
	ChevronLeft,
	Image as ImageIcon,
	Loader2,
	LogOut,
	MapPin,
	Paperclip,
	PencilLine,
	Plus,
	Sparkles,
	type LucideIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatMessageList } from "@/features/chat/components/ChatMessageList";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useMessages, CHAT_QUERY_KEYS } from "@/features/chat/queries";
import {
	getMessages,
	mapMessageRow,
	MESSAGE_PAGE_SIZE,
	type MessageRow,
} from "@/features/chat/apis";
import {
	useSendMessage,
	markMessagesRead,
	awardAndCreateContract,
} from "@/features/chat/mutations";
import { markNotificationsByQuoteRead } from "@/features/notifications/apis";
import { NOTIFICATION_QUERY_KEYS } from "@/features/notifications/queries";
import { createClient } from "@/libs/supabase";
import { VerificationBadge } from "@/features/verification/components/VerificationBadge";
import { cn } from "@/utils/cn";
import type { ChatMessage, ChatRole, ChatRoom } from "@/features/chat/types";

type ChatTool = {
	key: string;
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	disabled?: boolean;
};

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
	const [isHideModalOpen, setIsHideModalOpen] = useState(false);
	const [isHiding, setIsHiding] = useState(false);
	const [limitExceeded, setLimitExceeded] = useState(false);
	const [isLoadingOlder, setIsLoadingOlder] = useState(false);
	const [reachedOldest, setReachedOldest] = useState(false);
	const [hasOlderInitial, setHasOlderInitial] = useState<boolean | null>(null);
	const [isToolsOpen, setIsToolsOpen] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isUploadingFile, setIsUploadingFile] = useState(false);
	const [isSendingBankAccount, setIsSendingBankAccount] = useState(false);
	const [isSendingAddress, setIsSendingAddress] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const fileUploadInputRef = useRef<HTMLInputElement>(null);
	const toolsRef = useRef<HTMLDivElement>(null);
	const prefersReducedMotion = useReducedMotion();

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
		function markRead(): void {
			markMessagesRead(room.quoteId);
			// 알림을 읽음 처리한 뒤 캐시를 무효화해야 벨의 빨간 점이 바로 사라진다.
			markNotificationsByQuoteRead(room.quoteId).then(() => {
				queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
			});
		}

		// 백그라운드 탭에서도 읽음 처리를 하면 상대에게 실제로 보지 않은 메시지가
		// "읽음"으로 표시된다. 탭이 보일 때만 처리하고, 숨겨진 동안 쌓인 건
		// 다시 보이는 시점에 한 번에 처리한다.
		if (document.visibilityState === "visible") markRead();

		function handleVisibilityChange(): void {
			if (document.visibilityState === "visible") markRead();
		}
		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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

						// 탭이 백그라운드면 건너뛴다 — visibilitychange 리스너가 다시 보일 때 몰아서 처리한다.
						if (incoming.senderId !== myId && document.visibilityState === "visible") {
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

	useEffect(() => {
		if (!isToolsOpen) return;

		function handleOutsideClick(e: MouseEvent): void {
			if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
				setIsToolsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, [isToolsOpen]);

	function handleImageToolClick(): void {
		setIsToolsOpen(false);
		imageInputRef.current?.click();
	}

	async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		setIsUploadingImage(true);
		try {
			const formData = new FormData();
			formData.append("quoteId", room.quoteId);
			formData.append("file", file);
			const res = await fetch("/api/chat/upload-image", { method: "POST", body: formData });
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
		} catch (err) {
			console.error(err);
			alert(err instanceof Error && err.message ? err.message : t("uploadImageErrorMessage"));
		} finally {
			setIsUploadingImage(false);
		}
	}

	function handleFileToolClick(): void {
		setIsToolsOpen(false);
		fileUploadInputRef.current?.click();
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		setIsUploadingFile(true);
		try {
			const formData = new FormData();
			formData.append("quoteId", room.quoteId);
			formData.append("file", file);
			const res = await fetch("/api/chat/upload-file", { method: "POST", body: formData });
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
		} catch (err) {
			console.error(err);
			alert(err instanceof Error && err.message ? err.message : t("uploadFileErrorMessage"));
		} finally {
			setIsUploadingFile(false);
		}
	}

	async function handleBankAccountTool(): Promise<void> {
		setIsToolsOpen(false);
		setIsSendingBankAccount(true);
		try {
			const res = await fetch("/api/chat/send-info", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId: room.quoteId, kind: "bankAccount" }),
			});
			if (!res.ok) {
				const { error, code } = await res.json();
				if (code === "NO_BANK_ACCOUNT") {
					if (confirm(t("noBankAccountGuidance"))) {
						router.push("/seller/settings#bankAccount");
					}
					return;
				}
				throw new Error(error);
			}
		} catch (err) {
			console.error(err);
			alert(t("sendBankAccountErrorMessage"));
		} finally {
			setIsSendingBankAccount(false);
		}
	}

	async function handleAddressTool(): Promise<void> {
		setIsToolsOpen(false);
		setIsSendingAddress(true);
		try {
			const res = await fetch("/api/chat/send-info", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId: room.quoteId, kind: "address" }),
			});
			if (!res.ok) {
				const { error, code } = await res.json();
				if (code === "NO_ADDRESS") {
					alert(t("noAddressGuidance"));
					return;
				}
				throw new Error(error);
			}
		} catch (err) {
			console.error(err);
			alert(t("sendAddressErrorMessage"));
		} finally {
			setIsSendingAddress(false);
		}
	}

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

	function handleEditQuote(): void {
		router.push(`/seller/listing-browse/${room.listingId}`);
	}

	async function handleConfirmAward(): Promise<void> {
		setIsAwarding(true);
		try {
			const { invoiceWarning } = await awardAndCreateContract(room.quoteId);
			setIsAwardModalOpen(false);
			if (invoiceWarning) alert(invoiceWarning);
			router.refresh();
		} catch (err) {
			console.error(err);
			// 서버가 내려주는 구체적 사유(이미 마감된 공고 등)를 그대로 보여준다.
			alert(err instanceof Error && err.message ? err.message : t("awardErrorMessage"));
		} finally {
			setIsAwarding(false);
			setIsAwardModalOpen(false);
		}
	}

	async function handleHideRoom(): Promise<void> {
		setIsHiding(true);
		try {
			const res = await fetch("/api/chat/hide-room", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId: room.quoteId }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			setIsHideModalOpen(false);
			onBack();
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("hideRoomErrorMessage"));
		} finally {
			setIsHiding(false);
		}
	}

	const isSendingTool =
		isUploadingImage || isUploadingFile || isSendingBankAccount || isSendingAddress;

	// 견적서 도구는 채팅 시작 시 자동 전송되고 수정 시에도 자동 재전송되므로 서랍에서 제거했다.
	const tools: ChatTool[] =
		myRole === "seller"
			? [
					{
						key: "image",
						icon: ImageIcon,
						label: t("toolImage"),
						onClick: handleImageToolClick,
						disabled: isUploadingImage,
					},
					{
						key: "file",
						icon: Paperclip,
						label: t("toolFile"),
						onClick: handleFileToolClick,
						disabled: isUploadingFile,
					},
					{
						key: "bankAccount",
						icon: Banknote,
						label: t("toolBankAccount"),
						onClick: handleBankAccountTool,
						disabled: isSendingBankAccount,
					},
				]
			: [
					{
						key: "image",
						icon: ImageIcon,
						label: t("toolImage"),
						onClick: handleImageToolClick,
						disabled: isUploadingImage,
					},
					{
						key: "file",
						icon: Paperclip,
						label: t("toolFile"),
						onClick: handleFileToolClick,
						disabled: isUploadingFile,
					},
					{
						key: "address",
						icon: MapPin,
						label: t("toolAddress"),
						onClick: handleAddressTool,
						disabled: isSendingAddress,
					},
				];

	return (
		<section className="bg-imsg-surface flex min-h-0 flex-1 flex-col">
			{/* 헤더 */}
			<header className="flex items-center justify-between border-b border-[#E5E7EB]/60 bg-white/80 px-4 py-2.5 backdrop-blur-xl">
				<button
					onClick={onBack}
					aria-label={t("backToListAria")}
					className="text-imsg-blue hover:bg-imsg-surface flex size-9 items-center justify-center rounded-full transition-colors">
					<ChevronLeft className="size-6" strokeWidth={2.5} />
				</button>
				<div className="flex flex-col items-center">
					<div className="flex items-center gap-1.5">
						<Link
							href={`/companies/${room.partnerId}`}
							className="text-foreground hover:text-imsg-blue text-base leading-tight font-semibold transition-colors hover:underline">
							{room.partnerName}
						</Link>
						<VerificationBadge status={room.partnerVerificationStatus} />
					</div>
					{/* 어떤 거래 건의 대화인지 한눈에 보이도록 제목을 진하게 강조한다. */}
					<span className="mt-0.5 max-w-[320px] truncate text-sm font-medium text-[#374151]">
						{room.listingTitle}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					{myRole === "buyer" ? (
						room.quoteStatus === "awarded" ? (
							<span className="bg-imsg-blue/10 text-imsg-blue rounded-full px-3 py-1.5 text-xs font-semibold">
								{t("statusAwarded")}
							</span>
						) : room.quoteStatus === "rejected" ? (
							<span className="rounded-full bg-[#F3F4F6] px-3 py-1.5 text-xs font-semibold text-[#9CA3AF]">
								{t("statusRejected")}
							</span>
						) : (
							<button
								onClick={() => setIsAwardModalOpen(true)}
								className="bg-imsg-blue rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600">
								{t("awardButton")}
							</button>
						)
					) : (
						room.quoteStatus === "pending" && (
							<button
								onClick={handleEditQuote}
								className="hover:bg-imsg-surface flex items-center gap-1 rounded-full border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-semibold text-[#374151] transition-colors">
								<PencilLine size={12} />
								{t("editQuoteButton")}
							</button>
						)
					)}
					<button
						onClick={() => setIsHideModalOpen(true)}
						aria-label={t("hideRoomAria")}
						className="text-imsg-secondary hover:bg-imsg-surface flex size-9 items-center justify-center rounded-full transition-colors">
						<LogOut size={18} />
					</button>
				</div>
			</header>

			{/* 견적 정보 */}
			<div className="flex justify-center gap-2 border-b border-[#E5E7EB]/60 bg-white/60 px-4 py-2 backdrop-blur-xl">
				<span className="bg-imsg-surface text-imsg-secondary flex items-center gap-1 rounded-full px-3 py-1 text-xs">
					{t("quotePriceLabel")}{" "}
					<span className="text-foreground font-semibold">
						{room.currency} {room.price.toLocaleString()}
					</span>
				</span>
				<span className="bg-imsg-surface text-imsg-secondary flex items-center gap-1 rounded-full px-3 py-1 text-xs">
					{t("deliveryLabel")}{" "}
					<span className="text-foreground font-semibold">
						{t("deliveryDays", { days: room.deliveryDays })}
					</span>
				</span>
			</div>

			{/* 메시지 */}
			{isLoading ? (
				<div className="bg-imsg-surface flex-1" />
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
			<div className="relative border-t border-[#E5E7EB]/60 bg-white/80 px-4 py-3 backdrop-blur-xl">
				<AnimatePresence>
					{isSendingTool && (
						<motion.div
							key="sending-chip"
							initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.9 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.9 }}
							transition={
								prefersReducedMotion
									? { duration: 0 }
									: { type: "spring", stiffness: 400, damping: 26 }
							}
							className="absolute -top-9 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/80 px-3 py-1.5 text-xs text-white shadow-md">
							<Loader2 size={12} className="animate-spin" />
							{isUploadingImage
								? t("uploadingImage")
								: isUploadingFile
									? t("uploadingFile")
									: isSendingBankAccount
										? t("sendingBankAccount")
										: t("sendingAddress")}
						</motion.div>
					)}
				</AnimatePresence>
				<div className="mx-auto flex max-w-2xl items-center gap-2">
					<div ref={toolsRef} className="relative shrink-0">
						<AnimatePresence>
							{isToolsOpen && (
								<div className="absolute bottom-full left-0 mb-2 flex items-end gap-4">
									{tools.map((tool, i) => (
										<motion.button
											key={tool.key}
											onClick={tool.onClick}
											disabled={tool.disabled}
											initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.6 }}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={
												prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.6 }
											}
											transition={
												prefersReducedMotion
													? { duration: 0 }
													: { type: "spring", stiffness: 400, damping: 26, delay: i * 0.04 }
											}
											className="flex w-16 flex-col items-center gap-1.5 disabled:opacity-60">
											<span className="bg-imsg-blue flex size-14 items-center justify-center rounded-full text-white shadow-md">
												<tool.icon size={22} />
											</span>
											{/* 라벨 길이가 달라도 원형 버튼 간격이 흔들리지 않게 칸 폭을 고정한다. */}
											<span className="text-imsg-secondary w-full text-center text-xs font-medium whitespace-nowrap">
												{tool.label}
											</span>
										</motion.button>
									))}
								</div>
							)}
						</AnimatePresence>
						<button
							onClick={() => setIsToolsOpen((prev) => !prev)}
							disabled={isSendingTool}
							aria-label={t("toolsToggleAria")}
							aria-expanded={isToolsOpen}
							className="bg-imsg-surface text-imsg-secondary flex size-9 items-center justify-center rounded-full transition-all hover:bg-black/5 disabled:opacity-60">
							{isSendingTool ? (
								<Loader2 className="size-5 animate-spin" />
							) : (
								<Plus className={cn("size-5 transition-transform", isToolsOpen && "rotate-45")} />
							)}
						</button>
					</div>
					<div className="bg-imsg-surface flex flex-1 items-center rounded-full px-4 py-2.5">
						<textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onFocus={() => setIsToolsOpen(false)}
							onKeyDown={(e) => {
								if (
									e.key === "Enter" &&
									!e.shiftKey &&
									!e.nativeEvent.isComposing &&
									e.keyCode !== 229
								) {
									e.preventDefault();
									handleSend();
								}
							}}
							placeholder={t("messagePlaceholder")}
							rows={1}
							className="placeholder:text-imsg-secondary max-h-32 w-full resize-none bg-transparent text-sm outline-none"
						/>
					</div>
					<button
						onClick={handleSend}
						disabled={!input.trim()}
						className="bg-imsg-blue flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-all active:scale-90 disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF]">
						<ArrowUp className="size-5" strokeWidth={2.5} />
					</button>
				</div>
				<input
					ref={imageInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp,image/gif"
					className="hidden"
					onChange={handleImageChange}
				/>
				<input
					ref={fileUploadInputRef}
					type="file"
					accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.csv,.txt,.hwp"
					className="hidden"
					onChange={handleFileChange}
				/>
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

			<ConfirmModal
				isOpen={isHideModalOpen}
				title={t("hideRoomModalTitle")}
				description={t("hideRoomModalDescription")}
				confirmLabel={t("hideRoomModalConfirm")}
				isLoading={isHiding}
				onConfirm={handleHideRoom}
				onClose={() => setIsHideModalOpen(false)}
			/>
		</section>
	);
}
