"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import { QuotePdfCard } from "@/features/chat/components/QuotePdfCard";
import type { ChatMessage } from "@/features/chat/types";

const DEEPL_TARGET: Record<string, string> = {
	ko: "KO",
	id: "ID",
	en: "EN-US",
};

function formatTime(iso: string): string {
	const date = new Date(iso);
	return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

type ChatMessageListProps = {
	messages: ChatMessage[];
	myId: string;
	quoteId: string;
	hasOlder: boolean;
	isLoadingOlder: boolean;
	onLoadOlder: () => Promise<void>;
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

	async function handleLoadOlderClick(): Promise<void> {
		const container = containerRef.current;
		const prevScrollHeight = container?.scrollHeight ?? 0;
		await onLoadOlder();
		// 위쪽에 붙은 내용만큼 스크롤 위치를 보정해 화면이 튀지 않게 한다.
		requestAnimationFrame(() => {
			if (container) {
				container.scrollTop += container.scrollHeight - prevScrollHeight;
			}
		});
	}

	async function handleManualTranslate(messageId: string, content: string): Promise<void> {
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
	}

	const lastReadMineId = [...messages].reverse().find((m) => m.senderId === myId && m.isRead)?.id;
	const firstQuotePdfId = messages.find((m) => m.messageType === "quote_pdf")?.id;

	let lastDate = "";

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
					const isMine = message.senderId === myId;
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
					const showTime = !sameAsNext;
					const isLastMine = isMine && message.id === lastReadMineId;

					const autoTranslated = resolveTranslatedField(
						message.content,
						message.sourceLang,
						message.translations,
						locale,
					);
					const hasAutoTranslation = !isMine && autoTranslated !== message.content;
					const manualTranslation = manualTranslations[message.id];
					const displayText = hasAutoTranslation
						? autoTranslated
						: (manualTranslation ?? message.content);
					const showOriginal = !isMine && (hasAutoTranslation || Boolean(manualTranslation));
					const showTranslateButton = !isMine && !hasAutoTranslation && !manualTranslation;

					return (
						<div key={message.id} className={sameAsPrev ? "mt-0.5" : "mt-3"}>
							{showDate && (
								<div className="my-4 flex justify-center">
									<span className="text-imsg-secondary rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
										{dateLabel}
									</span>
								</div>
							)}

							<div
								className={cn("flex items-end gap-1.5", isMine ? "flex-row-reverse" : "flex-row")}>
								{/* 버블 + 번역 */}
								{message.messageType === "quote_pdf" || message.messageType === "invoice_pdf" ? (
									<QuotePdfCard
										quoteId={quoteId}
										docType={message.messageType === "invoice_pdf" ? "invoice" : "quote"}
										attachmentName={message.attachmentName}
										attachmentUrl={message.attachmentUrl}
										isMine={isMine}
										isOriginal={message.id === firstQuotePdfId}
									/>
								) : (
									<div className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
										<div
											className={cn(
												"w-fit rounded-[20px] px-3.5 py-2 text-sm leading-snug",
												isMine ? "bg-imsg-blue text-white" : "bg-[#E9E9EB] text-black",
											)}>
											<p className="break-words whitespace-pre-wrap">{displayText}</p>
										</div>
										{/* 번역 원문은 별도의 옅은 말풍선으로 분리 */}
										{showOriginal && (
											<div className="text-imsg-secondary w-fit rounded-[16px] bg-black/5 px-3 py-1.5 text-xs italic">
												<p className="break-words whitespace-pre-wrap">{message.content}</p>
											</div>
										)}
										{showTranslateButton && (
											<button
												onClick={() => handleManualTranslate(message.id, message.content)}
												disabled={translatingIds[message.id]}
												className="text-imsg-secondary hover:text-imsg-blue flex items-center gap-1 text-xs disabled:opacity-60">
												{translatingIds[message.id] ? (
													<Loader2 size={11} className="animate-spin" />
												) : (
													<Languages size={11} />
												)}
												{t("translateButton")}
											</button>
										)}
									</div>
								)}

								{/* 시간 + 읽음 */}
								<div className="flex shrink-0 items-center gap-1 pb-0.5">
									{isLastMine && (
										<span className="text-imsg-blue text-xs font-medium">{t("read")}</span>
									)}
									{showTime && (
										<span className="text-imsg-secondary text-xs">
											{formatTime(message.createdAt)}
										</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>
		</div>
	);
}
