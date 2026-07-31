"use client";

import { FileText, Lock } from "lucide-react";
import type { ChatRoom } from "@/features/chat/types";

type ChatRoomHeaderProps = {
	room: ChatRoom;
	onViewDocuments: () => void;
};

export function ChatRoomHeader({ room, onViewDocuments }: ChatRoomHeaderProps) {
	return (
		<div className="border-b border-[#E5E7EB] px-4 py-3">
			<div className="flex items-center gap-3">
				<div className="relative shrink-0">
					<div className="flex size-9 items-center justify-center rounded-full bg-[#ECFDF5] text-xs font-medium text-[#047857]">
						{room.partnerName.slice(0, 2)}
					</div>
					{room.isOnline && (
						<span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#10B981]" />
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-[#1F2937]">{room.partnerName}</p>
					<p className="truncate text-xs text-[#6B7280]">
						{room.isOnline ? "온라인 · " : ""}
						{room.contractTitle} 계약
					</p>
				</div>

				<button
					onClick={onViewDocuments}
					className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs text-[#374151] transition-colors hover:bg-gray-50"
				>
					<FileText size={14} />
					서류함
				</button>
			</div>

			<div className="mt-2.5 flex items-center gap-2 rounded-lg bg-[#FFFBEB] px-3 py-2">
				<Lock size={13} className="shrink-0 text-[#D97706]" />
				<span className="text-xs text-[#B45309]">계약 당사자만 볼 수 있는 대화예요</span>
			</div>
		</div>
	);
}