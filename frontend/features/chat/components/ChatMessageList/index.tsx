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
};

export function ChatMessageList({ messages, myId, quoteId }: ChatMessageListProps): React.ReactNode {
	const t = useTranslations("ChatMessageList");
	const locale = useLocale();
	const bottomRef = useRef<HTMLDivElement>(null);
	const prevLengthRef = useRef(0);
	const isInitialRef = useRef(true);
	const [manualTranslations, setManualTranslations] = useState<Record<string, string>>({});
	const [translatingIds, setTranslatingIds] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (isInitialRef.current) {
			// 최초 로드 시 즉시 맨 아래로
			bottomRef.current?.scrollIntoView({ behavior: "instant" });
			isInitialRef.current = false;
		} else if (messages.length > prevLengthRef.current) {
			// 새 메시지 수신 시만 스크롤
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
		}
		prevLengthRef.current = messages.length;
	}, [messages.length]);

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

	const lastReadMineId = [...messages]
		.reverse()
		.find((m) => m.senderId === myId && m.isRead)?.id;

	let lastDate = "";

	return (
		<div className="flex-1 overflow-y-auto bg-imsg-surface px-4 py-4" style={{ minHeight: 0 }}>
			<div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end">
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
					const displayText = hasAutoTranslation ? autoTranslated : (manualTranslation ?? message.content);
					const showOriginal = !isMine && (hasAutoTranslation || Boolean(manualTranslation));
					const showTranslateButton = !isMine && !hasAutoTranslation && !manualTranslation;

					return (
						<div key={message.id} className={sameAsPrev ? "mt-0.5" : "mt-3"}>
							{showDate && (
								<div className="my-4 flex justify-center">
									<span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-imsg-secondary">
										{dateLabel}
									</span>
								</div>
							)}

							<div className={cn("flex items-end gap-1.5", isMine ? "flex-row-reverse" : "flex-row")}>
								{/* 버블 + 번역 */}
								{(message.messageType === "quote_pdf" || message.messageType === "invoice_pdf") && message.attachmentUrl ? (
									<QuotePdfCard
										quoteId={quoteId}
										docType={message.messageType === "invoice_pdf" ? "invoice" : "quote"}
										attachmentName={message.attachmentName}
										isMine={isMine}
									/>
								) : (
									<div className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}>
										<div
											className={cn(
												"w-fit rounded-[20px] px-3.5 py-2 text-sm leading-snug",
												isMine
													? "bg-imsg-blue text-white"
													: "bg-[#E9E9EB] text-black",
											)}
										>
											<p className="whitespace-pre-wrap break-words">{displayText}</p>
										</div>
										{/* 번역 원문은 별도의 옅은 말풍선으로 분리 */}
										{showOriginal && (
											<div className="w-fit rounded-[16px] bg-black/5 px-3 py-1.5 text-xs italic text-imsg-secondary">
												<p className="whitespace-pre-wrap break-words">{message.content}</p>
											</div>
										)}
										{showTranslateButton && (
											<button
												onClick={() => handleManualTranslate(message.id, message.content)}
												disabled={translatingIds[message.id]}
												className="flex items-center gap-1 text-xs text-imsg-secondary hover:text-imsg-blue disabled:opacity-60"
											>
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
										<span className="text-xs font-medium text-imsg-blue">{t("read")}</span>
									)}
									{showTime && (
										<span className="text-xs text-imsg-secondary">
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
