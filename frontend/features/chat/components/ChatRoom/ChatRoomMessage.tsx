"use client";

import { Check, CheckCheck, FileType2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ChatMessage } from "@/features/chat/types";

type ChatRoomMessageProps = {
	message: ChatMessage;
	onOpenDocument: (message: ChatMessage) => void;
};

export function ChatRoomMessage({ message, onOpenDocument }: ChatRoomMessageProps) {
	if (message.type === "system") {
		return (
			<div className="my-3 text-center">
				<span className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-1 text-[11px] text-[#9CA3AF]">
					{message.content}
				</span>
			</div>
		);
	}

	return (
		<div className={cn("mb-2 flex", message.isMine && "justify-end")}>
			<div
				className={cn(
					"max-w-[78%] rounded-xl px-3 py-2.5",
					message.isMine
						? "rounded-tr-sm bg-[#ECFDF5]"
						: "rounded-tl-sm border border-[#E5E7EB] bg-white",
				)}
			>
				{message.type === "document" ? (
					<button
						onClick={() => onOpenDocument(message)}
						className="flex items-center gap-2.5 rounded-lg bg-[#F9FAFB] p-2.5 text-left transition-colors hover:bg-gray-100"
					>
						<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FEF2F2]">
							<FileType2 size={18} className="text-[#DC2626]" />
						</span>
						<span className="min-w-0">
							<span className="block truncate text-[13px] font-medium text-[#1F2937]">
								{message.fileName}
							</span>
							<span className="block truncate text-[11px] text-[#9CA3AF]">
								{message.fileSize} · {message.content}
							</span>
						</span>
					</button>
				) : (
					<p className="text-[13px] leading-relaxed text-[#1F2937]">{message.content}</p>
				)}

				<p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#9CA3AF]">
					{message.timeText}
					{message.isMine &&
						(message.isRead ? (
							<CheckCheck size={12} className="text-[#3B82F6]" />
						) : (
							<Check size={12} />
						))}
				</p>
			</div>
		</div>
	);
}