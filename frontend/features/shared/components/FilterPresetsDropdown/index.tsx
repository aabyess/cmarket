// features/shared/components/FilterPresetsDropdown/index.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Popover, PopoverButton } from "@headlessui/react";
import { Bookmark, Check, Plus, X } from "lucide-react";
import { AnimatedPopoverPanel } from "@/components/commons/AnimatedPopoverPanel";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { cn } from "@/utils/cn";
import type { FilterPreset } from "@/hooks/useFilterPresets";

type FilterPresetsDropdownProps<T> = {
	presets: FilterPreset<T>[];
	/** 현재 화면의 필터 상태 — 어떤 프리셋과 정확히 일치하는지 표시하는 데 쓰인다. */
	currentValue: T;
	onApply: (value: T) => void;
	onSave: (name: string) => void;
	onDelete: (id: string) => void;
};

// "현재 조건 저장" 폼을 별도 컴포넌트로 분리해서, AnimatedPopoverPanel이 닫힐 때
// (exit 애니메이션 끝나고) 언마운트되면 이름 입력 중이던 상태도 함께 초기화되게
// 한다 — 부모(FilterPresetsDropdown)는 팝오버가 닫혀도 계속 살아있어서 여기
// 상태를 두면 다시 열었을 때 반쯤 쓰던 입력이 남는다.
function FilterPresetsSaveForm({ onSave }: { onSave: (name: string) => void }): React.ReactNode {
	const t = useTranslations("FilterPresetsDropdown");
	const [newName, setNewName] = useState("");
	const [isNaming, setIsNaming] = useState(false);

	function handleSave(): void {
		const name = newName.trim();
		if (!name) return;
		onSave(name);
		setNewName("");
		setIsNaming(false);
	}

	if (!isNaming) {
		return (
			<button
				onClick={() => setIsNaming(true)}
				className="text-imsg-blue flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-[#EFF6FF]">
				<Plus size={13} />
				{t("saveCurrent")}
			</button>
		);
	}

	return (
		<div className="flex items-center gap-1 px-1 py-1">
			<input
				autoFocus
				value={newName}
				onChange={(e) => setNewName(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSave();
					if (e.key === "Escape") setIsNaming(false);
				}}
				placeholder={t("namePlaceholder")}
				className="focus:border-imsg-blue border-hairline min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-xs outline-none"
			/>
			<button
				onClick={handleSave}
				disabled={!newName.trim()}
				aria-label={t("saveConfirmAria")}
				className={cn(
					"flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
					newName.trim()
						? "text-imsg-blue hover:bg-[#EFF6FF]"
						: "cursor-not-allowed text-[#D1D5DB]",
				)}>
				<Check size={14} />
			</button>
		</div>
	);
}

// 화면의 필터/정렬 조합을 이름 붙여 저장·재적용하는 공용 드롭다운. 정렬 드롭다운과 같은
// Popover+AnimatedPopoverPanel 톤을 유지한다. 값 타입 T는 호출하는 화면이 정한다
// (useFilterPresets<T>의 T와 동일해야 한다).
export function FilterPresetsDropdown<T>({
	presets,
	currentValue,
	onApply,
	onSave,
	onDelete,
}: FilterPresetsDropdownProps<T>): React.ReactNode {
	const t = useTranslations("FilterPresetsDropdown");
	const [deletingPreset, setDeletingPreset] = useState<FilterPreset<T> | null>(null);
	// 필터 값은 화면마다 얕은 평면 객체(문자열/불리언/enum 조합)라 JSON 비교로 충분하다.
	const currentValueJson = JSON.stringify(currentValue);

	return (
		<>
			<Popover className="relative">
				{({ open, close }) => (
					<>
						<PopoverButton className="border-hairline flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
							<Bookmark size={14} />
							{t("label")}
						</PopoverButton>

						<AnimatedPopoverPanel
							open={open}
							className="border-hairline absolute left-0 z-20 mt-2 w-56 rounded-2xl border bg-white p-1.5 shadow-lg">
							{presets.length === 0 ? (
								<p className="text-subtle px-3 py-2 text-xs">{t("empty")}</p>
							) : (
								presets.map((preset) => {
									const isApplied = JSON.stringify(preset.value) === currentValueJson;
									return (
										<div key={preset.id} className="flex items-center gap-1">
											<button
												onClick={() => {
													onApply(preset.value);
													close();
												}}
												className={cn(
													"flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
													isApplied
														? "text-imsg-blue bg-[#EFF6FF]"
														: "text-[#374151] hover:bg-[#F9FAFB]",
												)}>
												{isApplied && <Check size={13} className="shrink-0" />}
												<span className="min-w-0 flex-1 truncate">{preset.name}</span>
											</button>
											<button
												onClick={() => setDeletingPreset(preset)}
												aria-label={t("deleteAria", { name: preset.name })}
												className="text-subtle flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]">
												<X size={13} />
											</button>
										</div>
									);
								})
							)}

							<div className="bg-hairline mx-1 my-1.5 h-px" />

							<FilterPresetsSaveForm onSave={onSave} />
						</AnimatedPopoverPanel>
					</>
				)}
			</Popover>

			<ConfirmModal
				isOpen={deletingPreset !== null}
				title={t("deleteConfirmTitle", { name: deletingPreset?.name ?? "" })}
				description={t("deleteConfirmDescription")}
				variant="danger"
				onConfirm={() => {
					if (deletingPreset) onDelete(deletingPreset.id);
					setDeletingPreset(null);
				}}
				onClose={() => setDeletingPreset(null)}
			/>
		</>
	);
}
