// features/chat/components/ChatMessageList/ChatMessageRow.tsx
"use client";

import { memo } from "react";
import { Languages, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import { QuotePdfCard } from "@/features/chat/components/QuotePdfCard";
import { ChatImageCard } from "@/features/chat/components/ChatImageCard";
import { ChatFileCard } from "@/features/chat/components/ChatFileCard";
import { ChatInfoCard } from "@/features/chat/components/ChatInfoCard";
import type { ChatMessage } from "@/features/chat/types";

function formatTime(iso: string): string {
	const date = new Date(iso);
	return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

type ChatMessageRowProps = {
	message: ChatMessage;
	quoteId: string;
	myId: string;
	locale: string;
	dateLabel: string;
	showDate: boolean;
	sameAsPrev: boolean;
	isCompactWithPrev: boolean;
	showTime: boolean;
	lastReadMineId: string | undefined;
	firstQuotePdfId: string | undefined;
	manualTranslation: string | undefined;
	isTranslating: boolean;
	onTranslate: (messageId: string, content: string) => void;
	readLabel: string;
	translateButtonLabel: string;
};

// ChatMessageList의 messages.map() 안에서 메시지 한 줄을 그리는 부분만 분리한 컴포넌트.
// manualTranslation/isTranslating은 이 메시지의 것만 이미 뽑아서 원시값으로 받고,
// onTranslate는 부모에서 useCallback으로 안정화된 함수를 그대로 받는다 — 다른 메시지의
// 번역 상태가 바뀌어도 이 메시지의 props가 그대로면 React.memo가 리렌더링을 막아준다.
export const ChatMessageRow = memo(function ChatMessageRow({
	message,
	quoteId,
	myId,
	locale,
	dateLabel,
	showDate,
	sameAsPrev,
	isCompactWithPrev,
	showTime,
	lastReadMineId,
	firstQuotePdfId,
	manualTranslation,
	isTranslating,
	onTranslate,
	readLabel,
	translateButtonLabel,
}: ChatMessageRowProps): React.ReactNode {
	const isMine = message.senderId === myId;
	const isLastMine = isMine && message.id === lastReadMineId;
	const isOriginalQuotePdf = message.id === firstQuotePdfId;

	const autoTranslated = resolveTranslatedField(
		message.content,
		message.sourceLang,
		message.translations,
		locale,
	);
	const hasAutoTranslation = !isMine && autoTranslated !== message.content;
	const displayText = hasAutoTranslation ? autoTranslated : (manualTranslation ?? message.content);
	const showOriginal = !isMine && (hasAutoTranslation || Boolean(manualTranslation));
	const showTranslateButton = !isMine && !hasAutoTranslation && !manualTranslation;

	return (
		<div className={isCompactWithPrev ? "mt-0.5" : sameAsPrev ? "mt-2.5" : "mt-3"}>
			{showDate && (
				<div className="my-4 flex justify-center">
					<span className="text-imsg-secondary rounded-full bg-black/5 px-3 py-1 text-xs font-medium">
						{dateLabel}
					</span>
				</div>
			)}

			<div className={cn("flex items-end gap-1.5", isMine ? "flex-row-reverse" : "flex-row")}>
				{/* 버블 + 번역 */}
				{message.messageType === "quote_pdf" || message.messageType === "invoice_pdf" ? (
					<QuotePdfCard
						quoteId={quoteId}
						docType={message.messageType === "invoice_pdf" ? "invoice" : "quote"}
						attachmentName={message.attachmentName}
						attachmentUrl={message.attachmentUrl}
						isMine={isMine}
						isOriginal={isOriginalQuotePdf}
					/>
				) : message.messageType === "image" ? (
					<ChatImageCard
						quoteId={quoteId}
						attachmentUrl={message.attachmentUrl}
						attachmentName={message.attachmentName}
					/>
				) : message.messageType === "file" ? (
					<ChatFileCard
						quoteId={quoteId}
						attachmentUrl={message.attachmentUrl}
						attachmentName={message.attachmentName}
					/>
				) : message.messageType === "info" ? (
					<ChatInfoCard content={message.content} />
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
								onClick={() => onTranslate(message.id, message.content)}
								disabled={isTranslating}
								className="text-imsg-secondary hover:text-imsg-blue flex items-center gap-1 text-xs disabled:opacity-60">
								{isTranslating ? (
									<Loader2 size={11} className="animate-spin" />
								) : (
									<Languages size={11} />
								)}
								{translateButtonLabel}
							</button>
						)}
					</div>
				)}

				{/* 시간 + 읽음 */}
				<div className="flex shrink-0 items-center gap-1 pb-0.5">
					{isLastMine && <span className="text-imsg-blue text-xs font-medium">{readLabel}</span>}
					{showTime && (
						<span className="text-imsg-secondary text-xs">{formatTime(message.createdAt)}</span>
					)}
				</div>
			</div>
		</div>
	);
});
