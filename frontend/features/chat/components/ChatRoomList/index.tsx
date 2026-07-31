"use client";

import { cn } from "@/utils/cn";
import type { ChatRoom } from "@/features/chat/types";

type ChatRoomListProps = {
	rooms: ChatRoom[];
	activeRoomId: string | null;
	onSelectRoom: (room: ChatRoom) => void;
};

export function ChatRoomList({ rooms, activeRoomId, onSelectRoom }: ChatRoomListProps) {
	return (
		<div className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white">
			<div className="border-b border-[#E5E7EB] px-4 py-3.5">
				<p className="text-[15px] font-medium text-[#1F2937]">채팅</p>
				<p className="mt-px text-xs text-[#6B7280]">계약 진행 중인 공급기업</p>
			</div>

			<div className="flex-1 overflow-y-auto">
				{rooms.map((room) => (
					<button
						key={room.id}
						onClick={() => onSelectRoom(room)}
						className={cn(
							"flex w-full items-center gap-3 border-b border-[#E5E7EB] px-4 py-3.5 text-left transition-colors",
							activeRoomId === room.id ? "bg-[#EFF6FF]" : "hover:bg-gray-50",
						)}
					>
						<div className="relative shrink-0">
							<div className="flex size-10 items-center justify-center rounded-full bg-[#ECFDF5] text-xs font-medium text-[#047857]">
								{room.partnerName.slice(0, 2)}
							</div>
							{room.isOnline && (
								<span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#10B981]" />
							)}
						</div>

						<div className="min-w-0 flex-1">
							<div className="flex items-center justify-between gap-2">
								<p className="truncate text-sm font-medium text-[#1F2937]">
									{room.partnerName}
								</p>
								<span className="shrink-0 text-[11px] text-[#9CA3AF]">
									{room.lastTimeText}
								</span>
							</div>
							<p className="truncate text-xs text-[#9CA3AF]">{room.contractTitle}</p>
							<p className="mt-0.5 truncate text-xs text-[#6B7280]">{room.lastMessage}</p>
						</div>

						{room.unreadCount > 0 && (
							<span className="shrink-0 rounded-full bg-[#EF4444] px-1.5 py-px text-[11px] text-white">
								{room.unreadCount}
							</span>
						)}
					</button>
				))}
			</div>
		</div>
	);
}