"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
import { ChatRoomList } from "@/features/chat/components/ChatRoomList";
import { ChatRoomPanel } from "@/features/chat/components/ChatRoomPanel";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { ChatContext, ChatRoom } from "@/features/chat/types";

const ROOM_LIST_MIN_WIDTH = 240;
const ROOM_LIST_MAX_WIDTH = 480;
const ROOM_LIST_DEFAULT_WIDTH = 300; // 기존 고정폭(w-[300px])

function clampRoomListWidth(width: number): number {
	return Math.min(ROOM_LIST_MAX_WIDTH, Math.max(ROOM_LIST_MIN_WIDTH, width));
}

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

	const [roomListWidth, setRoomListWidth] = usePersistentState<number>(
		"mitrapay:chat-room-list-width",
		ROOM_LIST_DEFAULT_WIDTH,
	);
	// 드래그 중엔 로컬 state로만 미리보기하고, 뗄 때 한 번만 localStorage에 커밋한다
	// (Sidebar 리사이즈와 같은 이유 — pointermove마다 저장하면 쓰기가 과도하다).
	const [previewWidth, setPreviewWidth] = useState<number | null>(null);
	const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

	const rooms: ChatRoom[] = context.rooms.map((room) =>
		readQuoteIds.has(room.quoteId) ? { ...room, unreadCount: 0 } : room,
	);

	const activeRoom = rooms.find((room) => room.quoteId === activeQuoteId) ?? null;

	function handleSelect(quoteId: string): void {
		setActiveQuoteId(quoteId);
		setReadQuoteIds((prev) => new Set(prev).add(quoteId));
	}

	function handleResizeHandlePointerDown(e: React.PointerEvent<HTMLButtonElement>): void {
		e.currentTarget.setPointerCapture(e.pointerId);
		dragStateRef.current = { startX: e.clientX, startWidth: roomListWidth };
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		function handlePointerMove(moveEvent: PointerEvent): void {
			const drag = dragStateRef.current;
			if (!drag) return;
			const dx = moveEvent.clientX - drag.startX;
			setPreviewWidth(clampRoomListWidth(drag.startWidth + dx));
		}

		function handlePointerUp(upEvent: PointerEvent): void {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";

			const drag = dragStateRef.current;
			dragStateRef.current = null;
			if (!drag) return;

			const dx = upEvent.clientX - drag.startX;
			setRoomListWidth(clampRoomListWidth(drag.startWidth + dx));
			setPreviewWidth(null);
		}

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	}

	return (
		<div className="flex h-screen overflow-hidden bg-white">
			<div
				style={{ width: `${previewWidth ?? roomListWidth}px` }}
				className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-[#E5E7EB]/60">
				<ChatRoomList
					rooms={rooms}
					activeQuoteId={activeQuoteId ?? undefined}
					onSelect={handleSelect}
				/>
				{/* 리사이즈 핸들 — 메인 사이드바 핸들과 같은 톤(sidebar-border/hover 배경)의
				    세로 막대. 접기 기능은 없어 클릭 처리 없이 순수 드래그로만 동작한다. */}
				<button
					type="button"
					onPointerDown={handleResizeHandlePointerDown}
					aria-label={t("resizeAria")}
					className="hover:bg-sidebar-border active:bg-sidebar-border absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize touch-none bg-transparent transition-colors"
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