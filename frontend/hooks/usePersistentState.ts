// hooks/usePersistentState.ts
"use client";

import { useCallback, useEffect, useState } from "react";

type SetPersistentState<T> = (value: T | ((prev: T) => T)) => void;

// 초기값으로 먼저 렌더한 뒤 마운트 후 useEffect에서 localStorage 값을 읽어 반영한다.
// PostListingForm의 초안 로드와 같은 원칙 — 렌더 중에 바로 읽으면 서버 렌더 결과와
// 클라이언트 첫 렌더가 달라져 하이드레이션 불일치가 난다.
export function usePersistentState<T>(storageKey: string, initialValue: T): [T, SetPersistentState<T>] {
	const [state, setState] = useState<T>(initialValue);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(storageKey);
			if (stored !== null) {
				setState(JSON.parse(stored) as T);
			}
		} catch {
			// 파싱 실패나 스토리지 접근 불가(사파리 프라이빗 모드 등)는 조용히 무시하고 기본값 유지
		}
	}, [storageKey]);

	const setPersistentState = useCallback<SetPersistentState<T>>(
		(value) => {
			setState((prev) => {
				const next = value instanceof Function ? value(prev) : value;
				try {
					localStorage.setItem(storageKey, JSON.stringify(next));
				} catch {
					// 스토리지 접근 불가는 무시 — 이번 세션 동안은 메모리 상태로만 동작
				}
				return next;
			});
		},
		[storageKey],
	);

	return [state, setPersistentState];
}
