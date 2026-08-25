// hooks/useDismissedTodos.ts
"use client";

import { usePersistentState } from "@/hooks/usePersistentState";

// 할 일 항목을 사용자 화면에서만 숨기는(dismiss) 개인화 설정. 실제 결제/견적
// 데이터는 건드리지 않고 id만 localStorage에 저장하므로, 해당 항목이 서버에서
// 나중에 실제로 사라져도(결제 완료 등) 남은 id는 그냥 안 쓰이게 될 뿐이라
// 별도 정리 로직은 필요 없다.
export function useDismissedTodos(storageKey: string): {
	isDismissed: (id: string) => boolean;
	dismiss: (id: string) => void;
} {
	const [dismissedIds, setDismissedIds] = usePersistentState<string[]>(storageKey, []);

	function isDismissed(id: string): boolean {
		return dismissedIds.includes(id);
	}

	function dismiss(id: string): void {
		setDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
	}

	return { isDismissed, dismiss };
}
