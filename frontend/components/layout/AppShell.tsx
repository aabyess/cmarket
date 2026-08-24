// components/layout/AppShell.tsx
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { usePersistentState } from "@/hooks/usePersistentState";
import { SIDEBAR_TRANSITION_CLASS } from "@/components/layout/sidebarTransition";
import {
	SIDEBAR_DEFAULT_STATE,
	SIDEBAR_RAIL_WIDTH,
	normalizeSidebarState,
	type SidebarState,
} from "@/components/layout/sidebarState";
import { cn } from "@/utils/cn";

type AppShellProps = {
	role: "buyer" | "seller";
	companyName: string;
	name: string;
	children: React.ReactNode;
};

export function AppShell({ role, companyName, name, children }: AppShellProps): React.ReactNode {
	const [rawState, setRawState] = usePersistentState<SidebarState | boolean>(
		"mitrapay:sidebar-collapsed",
		SIDEBAR_DEFAULT_STATE,
	);
	const sidebarState = normalizeSidebarState(rawState);
	// 드래그 중에는 매 pointermove마다 localStorage에 쓰지 않도록, 실시간 폭은 로컬
	// state로만 들고 있다가 드래그가 끝날 때만 커밋한다.
	const [liveWidth, setLiveWidth] = useState<number | null>(null);
	const [isResizing, setIsResizing] = useState(false);

	function updateSidebarState(updater: (prev: SidebarState) => SidebarState): void {
		setRawState((prev) => updater(normalizeSidebarState(prev)));
	}

	// liveWidth가 있으면(드래그 중) 그 값을 최우선으로 쓴다 — 접힘 상태에서 오른쪽으로
	// 드래그해 펼치는 도중에도 collapsed 플래그는 pointerup 전까지 그대로라, collapsed만
	// 보고 판단하면 드래그 내내 레일 폭에 고정돼 실시간 미리보기가 전혀 안 보인다.
	const renderedWidth = liveWidth ?? (sidebarState.collapsed ? SIDEBAR_RAIL_WIDTH : sidebarState.width);

	return (
		<div className="flex min-h-screen bg-[#F7F8F8]">
			<Sidebar
				role={role}
				companyName={companyName}
				name={name}
				isCollapsed={sidebarState.collapsed}
				width={renderedWidth}
				isResizing={isResizing}
				onToggleCollapsed={() =>
					updateSidebarState((prev) => ({ ...prev, collapsed: !prev.collapsed }))
				}
				onResizeStart={() => setIsResizing(true)}
				onResizePreview={setLiveWidth}
				onResizeEnd={(result) => {
					setIsResizing(false);
					setLiveWidth(null);
					if (result.collapsed) {
						updateSidebarState((prev) => ({ ...prev, collapsed: true }));
					} else {
						updateSidebarState(() => ({ collapsed: false, width: result.width }));
					}
				}}
			/>
			<div
				style={{ "--sidebar-w": `${renderedWidth}px` } as React.CSSProperties}
				className={cn(
					"flex-1 lg:ml-[var(--sidebar-w)]",
					!isResizing && "transition-[margin]",
					!isResizing && SIDEBAR_TRANSITION_CLASS,
				)}
			>
				<main>{children}</main>
			</div>
		</div>
	);
}
