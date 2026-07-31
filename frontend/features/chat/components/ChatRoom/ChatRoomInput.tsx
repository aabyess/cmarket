"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

type ChatRoomInputProps = {
	onSend: (content: string) => void;
	onAttach: () => void;
};

export function ChatRoomInput({ onSend, onAttach }: ChatRoomInputProps) {
	const [content, setContent] = useState("");

	function handleSend() {
		if (!content.trim()) return;
		onSend(content.trim());
		setContent("");
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	return (
		<div className="flex items-center gap-2 border-t border-[#E5E7EB] px-4 py-3">
			<button
				onClick={onAttach}
				className="shrink-0 text-[#9CA3AF] transition-colors hover:text-[#374151]"
			>
				<Paperclip size={20} />
			</button>

			<input
				type="text"
				value={content}
				onChange={(e) => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="메시지 입력"
				className="flex-1 rounded-full border border-[#E5E7EB] px-4 py-2.5 text-[13px] text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
			/>

			<button
				onClick={handleSend}
				disabled={!content.trim()}
				className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#3B82F6] text-white transition-colors hover:bg-[#2563EB] disabled:opacity-40"
			>
				<Send size={16} />
			</button>
		</div>
	);
}