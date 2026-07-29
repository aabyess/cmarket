"use client";

import { MessageSquare, X } from "lucide-react";
import { useState } from "react";

export function ChatFab() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
			{isOpen && (
				<div className="w-80 h-96 bg-white rounded-xl shadow-xl border border-[#E5E7EB] flex flex-col overflow-hidden">
					<div className="px-4 py-3 bg-[#1B3A6B] flex items-center justify-between">
						<span className="text-white font-semibold text-sm">채팅</span>
						<button
							onClick={() => setIsOpen(false)}
							className="text-white/70 hover:text-white transition-colors">
							<X size={18} />
						</button>
					</div>
					<div className="flex-1 p-4 flex items-center justify-center">
						<p className="text-[#9CA3AF] text-sm">채팅 기능 준비 중입니다.</p>
					</div>
				</div>
			)}

			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-14 h-14 bg-[#1B3A6B] hover:bg-[#152d54] text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105">
				{isOpen ? <X size={22} /> : <MessageSquare size={22} />}
			</button>
		</div>
	);
}