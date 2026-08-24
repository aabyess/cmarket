// hooks/useDashboardWidgets.ts
"use client";

import { useState } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

// 대시보드 위젯 커스터마이징(편집 모드 진입 시 위젯을 숨기고/다시 보이기, 같은 영역
// 안에서 순서 바꾸기) 공용 로직. 편집 모드 자체는 새로고침 때마다 꺼진 상태로 시작하는
// 게 자연스러워 localStorage에 넣지 않고, 숨긴 위젯 목록과 순서만 영속화한다.
// order는 reorderable한 위젯(예: 사이드 컬럼)에 한정해 initialOrder로 전달받는다 —
// 메인 영역처럼 순서를 바꾸지 않는 위젯은 order 대상에 포함하지 않아도 된다. K는
// hide/show 대상 전체 위젯 키, O는 그중 순서 변경 대상(K의 부분집합)이다.
export function useDashboardWidgets<K extends string, O extends K = K>(
	storageKey: string,
	initialOrder: O[],
) {
	const [hiddenKeys, setHiddenKeys] = usePersistentState<K[]>(storageKey, []);
	const [order, setOrder] = usePersistentState<O[]>(`${storageKey}-order`, initialOrder);
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

	function resetHidden(): void {
		setHiddenKeys([]);
	}

	function reorder(newOrder: O[]): void {
		setOrder(newOrder);
	}

	// localStorage에 저장된 순서가 initialOrder와 키 구성이 달라지면(신규 위젯 추가 등)
	// 없는 키는 버리고 빠진 키는 뒤에 붙여서 항상 initialOrder와 같은 키 집합을 보장한다.
	const safeOrder = [
		...order.filter((key) => initialOrder.includes(key)),
		...initialOrder.filter((key) => !order.includes(key)),
	];

	return {
		isEditing,
		toggleEditing: () => setIsEditing((prev) => !prev),
		hiddenKeys,
		hideWidget,
		showWidget,
		isHidden,
		resetHidden,
		order: safeOrder,
		reorder,
	};
}
