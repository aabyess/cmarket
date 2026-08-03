"use client";

import { Truck, Award, CheckCircle2 } from "lucide-react";
import type { Currency } from "@/features/buyer/types";
import type { ChatRole, ChatRoom } from "@/features/chat/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

type ChatRoomHeaderProps = {
	room: ChatRoom;
	myRole: ChatRole;
	onAward: () => void;
};

export function ChatRoomHeader({ room, myRole, onAward }: ChatRoomHeaderProps) {
	const symbol = CURRENCY_SYMBOL[room.currency];
	const canAward = myRole === "buyer" && room.quoteStatus === "pending";
	return (
		<div className="border-b border-[#E5E7EB] bg-white px-5 py-4">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="truncate text-[15px] font-semibold text-[#1F2937]">
						{room.partnerName}
					</p>
					<p className="truncate text-xs text-[#6B7280]">{room.listingTitle}</p>
				</div>

				{room.quoteStatus === "awarded" && (
					<span className="flex shrink-0 items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-medium text-[#059669]">
						<CheckCircle2 size={12} />
						거래 확정
					</span>
				)}
			</div>

			<div className="mt-3 flex items-center gap-5 rounded-lg bg-[#F9FAFB] px-4 py-2.5">
				<div>
					<p className="text-[11px] text-[#9CA3AF]">견적가</p>
					<p className="text-[15px] font-semibold text-[#1F2937]">
						{symbol} {room.price.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
						<Truck size={11} />
						납품
					</p>
					<p className="text-[15px] font-semibold text-[#1F2937]">{room.deliveryDays}일</p>
				</div>

				{canAward && (
					<button
						onClick={onAward}
						className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2563EB]"
					>
						<Award size={15} />
						이 기업으로 확정
					</button>
				)}
			</div>
		</div>
	);
}