"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ChatRoom } from "@/features/chat/types";

function formatTime(iso: string | null): string {
	if (!iso) return "";
	const date = new Date(iso);
	const now = new Date();
	const isToday = date.toDateString() === now.toDateString();

	if (isToday) {
		return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
	}
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

const GRADIENTS = [
	"from-blue-400 to-indigo-500",
	"from-emerald-400 to-teal-500",
	"from-orange-400 to-rose-500",
	"from-fuchsia-400 to-purple-500",
	"from-amber-400 to-orange-500",
];

function getGradient(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

type ChatRoomListProps = {
	rooms: ChatRoom[];
	activeQuoteId?: string;
	onSelect: (quoteId: string) => void;
};

export function ChatRoomList({ rooms, activeQuoteId, onSelect }: ChatRoomListProps): React.ReactNode {
	const [search, setSearch] = useState("");

	const filtered = rooms.filter(
		(r) =>
			r.partnerName.toLowerCase().includes(search.toLowerCase()) ||
			r.listingTitle.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<aside className="flex w-[300px] shrink-0 flex-col border-r border-[#E5E7EB]/60 bg-white">
			<div className="px-5 pb-2 pt-6">
				<h1 className="text-3xl font-bold tracking-tight text-[#0f172a]">채팅</h1>
			</div>

			<div className="px-4 pb-3">
				<div className="flex items-center gap-2 rounded-xl bg-imsg-surface px-3 py-2">
					<Search className="size-4 text-imsg-secondary" strokeWidth={2.5} />
					<input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="검색"
						className="w-full bg-transparent text-[15px] outline-none placeholder:text-imsg-secondary"
					/>
				</div>
			</div>

			<nav className="flex-1 overflow-y-auto px-2 pb-4">
				{filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<p className="text-sm font-medium text-[#1F2937]">대화가 없어요</p>
						<p className="mt-1 text-xs text-imsg-secondary">
							견적을 주고받으면 여기에서 대화할 수 있어요.
						</p>
					</div>
				) : (
					filtered.map((room) => (
						<button
							key={room.quoteId}
							onClick={() => onSelect(room.quoteId)}
							className={cn(
								"flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
								activeQuoteId === room.quoteId
									? "bg-imsg-blue/10"
									: "hover:bg-imsg-surface/70",
							)}
						>
							<div
								className={cn(
									"flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-semibold text-white shadow-sm",
									getGradient(room.partnerName),
								)}
							>
								{room.partnerName.slice(0, 2)}
							</div>

							<div className="min-w-0 flex-1">
								<div className="flex items-baseline justify-between gap-2">
									<span className="truncate text-[15px] font-semibold text-[#0f172a]">
										{room.partnerName}
									</span>
									<span className="shrink-0 text-[11px] text-imsg-secondary">
										{formatTime(room.lastMessageAt)}
									</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="truncate text-[13px] text-imsg-secondary">
										{room.lastMessage}
									</span>
									{room.unreadCount > 0 && (
										<span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-imsg-blue text-[11px] font-semibold text-white">
											{room.unreadCount}
										</span>
									)}
								</div>
							</div>
						</button>
					))
				)}
			</nav>
		</aside>
	);
}