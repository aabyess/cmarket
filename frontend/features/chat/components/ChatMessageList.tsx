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

export function ChatMessageList({ messages, myId }: ChatMessageListProps) {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages.length]);

	const lastReadMineId = [...messages]
		.reverse()
		.find((message) => message.senderId === myId && message.isRead)?.id;

	let lastDate = "";

	return (
		<div className="flex-1 space-y-2 overflow-y-auto bg-[#F0F5FF] px-5 py-4">
			{messages.map((message) => {
				const isMine = message.senderId === myId;
				const dateLabel = formatDateLabel(message.createdAt);
				const showDate = dateLabel !== lastDate;
				lastDate = dateLabel;

				return (
					<div key={message.id}>
						{showDate && (
							<div className="my-4 flex justify-center">
								<span className="rounded-full bg-white px-3 py-1 text-[11px] text-[#6B7280]">
									{dateLabel}
								</span>
							</div>
						)}

						<div className={cn("flex items-end gap-1.5", isMine && "flex-row-reverse")}>
							<div
								className={cn(
									"max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
									isMine
										? "rounded-br-sm bg-[#3B82F6] text-white"
										: "rounded-bl-sm bg-white text-[#1F2937]",
								)}
							>
								<p className="whitespace-pre-wrap break-words">{message.content}</p>
							</div>

							<div className="flex shrink-0 flex-col items-end">
								{message.id === lastReadMineId && (
									<span className="text-[10px] text-[#3B82F6]">읽음</span>
								)}
								<span className="text-[10px] text-[#9CA3AF]">
									{formatTime(message.createdAt)}
								</span>
							</div>
						</div>
					</div>
				);
			})}
			<div ref={bottomRef} />
		</div>
	);
}