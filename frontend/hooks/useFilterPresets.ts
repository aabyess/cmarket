// hooks/useFilterPresets.ts
"use client";

import { usePersistentState } from "@/hooks/usePersistentState";

export type FilterPreset<T> = {
	id: string;
	name: string;
	value: T;
};

type UseFilterPresetsResult<T> = {
	presets: FilterPreset<T>[];
	savePreset: (name: string, value: T) => void;
	deletePreset: (id: string) => void;
};

// 화면별 필터/정렬 조합에 이름을 붙여 여러 개 저장하고 다시 적용할 수 있게 하는 공용 로직.
// 현재 값 자체(useDashboardWidgets의 hiddenKeys 같은 단일 상태)가 아니라, 이름이 붙은
// "스냅샷" 여러 개를 목록으로 영속화한다는 점이 다르다.
export function useFilterPresets<T>(storageKey: string): UseFilterPresetsResult<T> {
	const [presets, setPresets] = usePersistentState<FilterPreset<T>[]>(storageKey, []);

	function savePreset(name: string, value: T): void {
		setPresets((prev) => [...prev, { id: crypto.randomUUID(), name, value }]);
	}

	function deletePreset(id: string): void {
		setPresets((prev) => prev.filter((preset) => preset.id !== id));
	}

	return { presets, savePreset, deletePreset };
}
