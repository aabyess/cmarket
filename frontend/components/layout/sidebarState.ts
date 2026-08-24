// components/layout/sidebarState.ts

export type SidebarState = {
	collapsed: boolean;
	width: number;
};

export const SIDEBAR_RAIL_WIDTH = 80;
export const SIDEBAR_MIN_WIDTH = 208; // 기존 w-52 폭
export const SIDEBAR_MAX_WIDTH = 400;
// 이 값보다 좁게 드래그하면 리사이즈 대신 접힘(레일)으로 스냅한다.
export const SIDEBAR_COLLAPSE_THRESHOLD = 140;
export const SIDEBAR_DEFAULT_WIDTH = 256; // 기존 w-64 폭

export const SIDEBAR_DEFAULT_STATE: SidebarState = {
	collapsed: false,
	width: SIDEBAR_DEFAULT_WIDTH,
};

// 예전엔 "mitrapay:sidebar-collapsed"에 boolean만 저장했다. 그 값이 그대로 남아있는
// 사용자를 위해 boolean이면 {collapsed: 그 값, width: 기본값}으로 해석한다.
export function normalizeSidebarState(raw: SidebarState | boolean): SidebarState {
	if (typeof raw === "boolean") return { collapsed: raw, width: SIDEBAR_DEFAULT_WIDTH };
	return raw;
}

export function clampSidebarWidth(width: number): number {
	return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}
