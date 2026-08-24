// hooks/useDashboardWidgets.ts
"use client";

import { useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

// 대시보드 위젯 커스터마이징(편집 모드 진입 시 위젯을 숨기고/다시 보이기) 공용 로직.
// 편집 모드 자체는 새로고침 때마다 꺼진 상태로 시작하는 게 자연스러워 localStorage에
// 넣지 않고, 숨긴 위젯 목록만 영속화한다.
export function useDashboardWidgets<K extends string>(storageKey: string) {
	const [hiddenKeys, setHiddenKeys] = usePersistentState<K[]>(storageKey, []);
	const [isEditing, setIsEditing] = useState(false);

	function hideWidget(key: K): void {
		setHiddenKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
	}

	function showWidget(key: K): void {
		setHiddenKeys((prev) => prev.filter((existing) => existing !== key));
	}

	function isHidden(key: K): boolean {
		return hiddenKeys.includes(key);
	}

	return {
		isEditing,
		toggleEditing: () => setIsEditing((prev) => !prev),
		hiddenKeys,
		hideWidget,
		showWidget,
		isHidden,
	};
}
