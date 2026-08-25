"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { ChatMessageRow } from "@/features/chat/components/ChatMessageList/ChatMessageRow";
import type { ChatMessage } from "@/features/chat/types";

const DEEPL_TARGET: Record<string, string> = {
	ko: "KO",
	id: "ID",
	en: "EN-US",
};

type ChatMessageListProps = {
	messages: ChatMessage[];
	myId: string;
	quoteId: string;
	hasOlder: boolean;
	isLoadingOlder: boolean;
	onLoadOlder: () => Promise<void>;
};

// 메시지별 날짜/줄바꿈 레이아웃은 앞뒤 메시지를 함께 봐야 나오는 값이라 messages 전체를
// 훑어야 한다 — messages가 실제로 바뀔 때만 다시 계산되도록 useMemo로 감싼다. 번역
// 상태(manualTranslations/translatingIds)가 바뀌어 이 컴포넌트가 리렌더링돼도 이 값들은
// 다시 계산되지 않는다.
type MessageLayout = {
	dateLabel: string;
	showDate: boolean;
	sameAsPrev: boolean;
	isCompactWithPrev: boolean;
	showTime: boolean;
};

export function ChatMessageList({
	messages,
	myId,
	quoteId,
	hasOlder,
	isLoadingOlder,
	onLoadOlder,
}: ChatMessageListProps): React.ReactNode {
	const t = useTranslations("ChatMessageList");
	const locale = useLocale();
	const containerRef = useRef<HTMLDivElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const prevLastIdRef = useRef<string | null>(null);
	const isInitialRef = useRef(true);
	const [manualTranslations, setManualTranslations] = useState<Record<string, string>>({});
	const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

	// 이전 대화를 위쪽에 붙일 때는 스크롤하면 안 되므로,
	// 배열 길이가 아니라 "마지막 메시지"가 바뀌었을 때만 아래로 스크롤한다.
	const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

	useEffect(() => {
		if (isInitialRef.current) {
			// 최초 로드 시 즉시 맨 아래로
			bottomRef.current?.scrollIntoView({ behavior: "instant" });
			isInitialRef.current = false;
		} else if (lastMessageId !== null && lastMessageId !== prevLastIdRef.current) {
			// 새 메시지 수신 시만 스크롤
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
		prevLastIdRef.current = lastMessageId;
	}, [lastMessageId]);

	const handleLoadOlderClick = useCallback(async (): Promise<void> => {
		const container = containerRef.current;
		const prevScrollHeight = container?.scrollHeight ?? 0;
		await onLoadOlder();
		// 위쪽에 붙은 내용만큼 스크롤 위치를 보정해 화면이 튀지 않게 한다.
		requestAnimationFrame(() => {
			if (container) {
				container.scrollTop += container.scrollHeight - prevScrollHeight;
			}
		});
	}, [onLoadOlder]);

	// ChatMessageRow에 그대로 전달되는 안정된 함수 참조 — 매 렌더마다 새로 만들어지면
	// React.memo가 무력화된다.
	const handleManualTranslate = useCallback(
		async (messageId: string, content: string): Promise<void> => {
			setTranslatingIds((prev) => ({ ...prev, [messageId]: true }));
			try {
				const res = await fetch("/api/translate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: content, targetLang: DEEPL_TARGET[locale] ?? "EN-US" }),
				});
				const data = await res.json();
				if (data.translatedText) {
					setManualTranslations((prev) => ({ ...prev, [messageId]: data.translatedText }));
				}
			} catch {
				// 번역 실패해도 원문은 계속 보인다
			} finally {
				setTranslatingIds((prev) => ({ ...prev, [messageId]: false }));
			}
		},
		[locale],
	);

	const lastReadMineId = useMemo(
		() => [...messages].reverse().find((m) => m.senderId === myId && m.isRead)?.id,
		[messages, myId],
	);
	const firstQuotePdfId = useMemo(
		() => messages.find((m) => m.messageType === "quote_pdf")?.id,
		[messages],
	);

	const messageLayouts = useMemo<MessageLayout[]>(() => {
		let lastDate = "";
		return messages.map((message, i) => {
			const createdAt = new Date(message.createdAt);
			const dateLabel = t("dateLabel", {
				year: createdAt.getFullYear(),
				month: createdAt.getMonth() + 1,
				day: createdAt.getDate(),
			});
			const showDate = dateLabel !== lastDate;
			lastDate = dateLabel;

			const prev = messages[i - 1];
			const next = messages[i + 1];
			const sameAsPrev = prev?.senderId === message.senderId;
			const sameAsNext = next?.senderId === message.senderId;
			// 텍스트 버블끼리만 촘촘하게 붙이고, 이미지/파일/카드류가 끼면 여백을 더 준다.
			const isCompactWithPrev =
				sameAsPrev && message.messageType === "text" && prev?.messageType === "text";
			const showTime = !sameAsNext;

			return { dateLabel, showDate, sameAsPrev, isCompactWithPrev, showTime };
		});
	}, [messages, t]);

	const readLabel = t("read");
	const translateButtonLabel = t("translateButton");

	return (
		<div
			ref={containerRef}
			className="bg-imsg-surface flex-1 overflow-y-auto px-4 py-4"
			style={{ minHeight: 0 }}>
			<div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end">
				{hasOlder && (
					<div className="flex justify-center pb-2">
						<button
							onClick={handleLoadOlderClick}
							disabled={isLoadingOlder}
							className="text-imsg-secondary hover:text-imsg-blue flex items-center gap-1.5 rounded-full bg-black/5 px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-60">
							{isLoadingOlder && <Loader2 size={12} className="animate-spin" />}
							{t("loadOlderButton")}
						</button>
					</div>
				)}
				{messages.map((message, i) => {
					const layout = messageLayouts[i];
					return (
						<ChatMessageRow
							key={message.id}
							message={message}
							quoteId={quoteId}
							myId={myId}
							locale={locale}
							dateLabel={layout.dateLabel}
							showDate={layout.showDate}
							sameAsPrev={layout.sameAsPrev}
							isCompactWithPrev={layout.isCompactWithPrev}
							showTime={layout.showTime}
							lastReadMineId={lastReadMineId}
							firstQuotePdfId={firstQuotePdfId}
							manualTranslation={manualTranslations[message.id]}
							isTranslating={translatingIds[message.id] ?? false}
							onTranslate={handleManualTranslate}
							readLabel={readLabel}
							translateButtonLabel={translateButtonLabel}
						/>
					);
				})}
				<div ref={bottomRef} />
			</div>
		</div>
	);
}
