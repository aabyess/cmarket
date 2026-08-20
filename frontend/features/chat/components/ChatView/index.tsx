"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { ChatRoomPanel } from "@/features/chat/components/ChatRoomPanel";
import type { ChatContext, ChatRoom } from "@/features/chat/types";

type ChatViewProps = {
	context: ChatContext;
	initialQuoteId?: string;
};

export function ChatView({ context, initialQuoteId }: ChatViewProps): React.ReactNode {
	const t = useTranslations("ChatView");
	const [activeQuoteId, setActiveQuoteId] = useState<string | null>(initialQuoteId ?? null);
	// rooms를 state로 복사하면 낙찰 후 router.refresh()로 갱신된 서버 데이터가 반영되지 않는다.
	// props에서 파생하고, 이 세션에서 읽음 처리한 방만 별도로 기억한다.
	const [readQuoteIds, setReadQuoteIds] = useState<Set<string>>(new Set());

	const rooms: ChatRoom[] = context.rooms.map((room) =>
		readQuoteIds.has(room.quoteId) ? { ...room, unreadCount: 0 } : room,
	);

	const activeRoom = rooms.find((room) => room.quoteId === activeQuoteId) ?? null;

	function handleSelect(quoteId: string): void {
		setActiveQuoteId(quoteId);
		setReadQuoteIds((prev) => new Set(prev).add(quoteId));
	}

	return (
		<div className="flex h-screen overflow-hidden bg-white">
			<div className="flex h-full w-[300px] shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB]/60">
				<ChatRoomList
					rooms={rooms}
					activeQuoteId={activeQuoteId ?? undefined}
					onSelect={handleSelect}
				/>
			</div>

			<div className="flex h-full flex-1 flex-col overflow-hidden">
				{activeRoom ? (
					<ChatRoomPanel
						key={activeRoom.quoteId}
						room={activeRoom}
						myId={context.myId}
						myRole={context.myRole}
						onBack={() => setActiveQuoteId(null)}
					/>
				) : (
					<div className="flex h-full flex-col items-center justify-center bg-white">
						<div className="mb-3 flex size-14 items-center justify-center rounded-full bg-imsg-surface">
							<MessageSquare size={26} className="text-[#9CA3AF]" />
						</div>
						<p className="text-sm font-medium text-foreground">{t("emptyTitle")}</p>
						<p className="mt-1 text-sm text-imsg-secondary">
							{t("emptyDescription")}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}