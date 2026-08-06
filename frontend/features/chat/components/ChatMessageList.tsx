"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";
import type { ChatMessage } from "@/features/chat/types";

function formatTime(iso: string): string {
	const date = new Date(iso);
	return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDateLabel(iso: string): string {
	const date = new Date(iso);
	return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

type ChatMessageListProps = {
	messages: ChatMessage[];
	myId: string;
};

export function ChatMessageList({ messages, myId }: ChatMessageListProps): React.ReactNode {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const lastReadMineId = [...messages]
		.reverse()
		.find((m) => m.senderId === myId && m.isRead)?.id;

	let lastDate = "";

	return (
		<div className="flex-1 overflow-y-auto bg-imsg-surface px-4 py-4">
			<div className="mx-auto flex max-w-2xl flex-col">
				{messages.map((message, i) => {
					const isMine = message.senderId === myId;
					const dateLabel = formatDateLabel(message.createdAt);
					const showDate = dateLabel !== lastDate;
					lastDate = dateLabel;

					const prev = messages[i - 1];
					const next = messages[i + 1];
					const sameAsPrev = prev?.senderId === message.senderId;
					const sameAsNext = next?.senderId === message.senderId;
					const showTime = !sameAsNext || next?.senderId !== message.senderId;
					const isLastMine = isMine && message.id === lastReadMineId;
					const hasTranslation = !isMine && Boolean(message.translatedContent);

					return (
						<div key={message.id} className={sameAsPrev ? "mt-0.5" : "mt-3"}>
							{showDate && (
								<div className="my-4 flex justify-center">
									<span className="rounded-full bg-black/5 px-3 py-1 text-[11px] font-medium text-imsg-secondary">
										{dateLabel}
									</span>
								</div>
							)}

							<div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
								<div className="flex max-w-[70%] flex-col">
									<div
										className={cn(
											"w-fit rounded-[20px] px-3.5 py-2 text-[15px] leading-snug",
											isMine
												? "self-end bg-imsg-blue text-white"
												: "self-start bg-[#E9E9EB] text-black",
										)}
									>
										<p className="whitespace-pre-wrap break-words">{message.content}</p>
									</div>

									{hasTranslation && (
										<p className="mt-1 self-start px-1 text-[13px] italic text-imsg-secondary">
											{message.translatedContent}
										</p>
									)}
								</div>
							</div>

							{showTime && (
								<div className="mt-1 flex justify-center">
									<span className="text-[11px] text-imsg-secondary">
										{formatTime(message.createdAt)}
									</span>
								</div>
							)}

							{isLastMine && (
								<div className="flex justify-end pr-1">
									<span className="text-[11px] font-medium text-imsg-blue">읽음</span>
								</div>
							)}
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>
		</div>
	);
}