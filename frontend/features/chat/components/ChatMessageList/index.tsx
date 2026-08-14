"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import { QuotePdfCard } from "@/features/chat/components/QuotePdfCard";
import type { ChatMessage } from "@/features/chat/types";

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
	const bottomRef = useRef<HTMLDivElement>(null);
	const prevLengthRef = useRef(0);
	const isInitialRef = useRef(true);

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
					const hasTranslation = !isMine && Boolean(message.translatedContent);

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
											<p className="whitespace-pre-wrap break-words">
												{hasTranslation ? message.translatedContent : message.content}
											</p>
										</div>
										{/* 번역 원문은 별도의 옅은 말풍선으로 분리 */}
										{hasTranslation && (
											<div className="w-fit rounded-[16px] bg-black/5 px-3 py-1.5 text-xs italic text-imsg-secondary">
												<p className="whitespace-pre-wrap break-words">{message.content}</p>
											</div>
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