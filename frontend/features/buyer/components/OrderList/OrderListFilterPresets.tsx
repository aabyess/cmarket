// features/buyer/components/OrderList/OrderListFilterPresets.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Popover, PopoverButton } from "@headlessui/react";
import { Bookmark, Check, Plus, X } from "lucide-react";
import { AnimatedPopoverPanel } from "@/components/commons/AnimatedPopoverPanel";
import { cn } from "@/utils/cn";
import type { FilterPreset } from "@/hooks/useFilterPresets";
import type { SortOption } from "@/features/buyer/components/OrderList/OrderListFilterBar";
import type { DisplayListingStatus } from "@/utils/getDisplayListingStatus";

export type OrderListFilterPresetValue = {
	search: string;
	sort: SortOption;
	statusFilter: DisplayListingStatus | null;
	bookmarkedOnly: boolean;
};

type OrderListFilterPresetsProps = {
	presets: FilterPreset<OrderListFilterPresetValue>[];
	onApply: (value: OrderListFilterPresetValue) => void;
	onSave: (name: string) => void;
	onDelete: (id: string) => void;
};

// "현재 조건 저장"을 누르면 같은 패널 안에서 이름 입력 폼으로 전환되는 방식 — 별도
// 모달 없이 정렬 드롭다운과 같은 Popover+AnimatedPopoverPanel 톤을 유지한다.
export function OrderListFilterPresets({
	presets,
	onApply,
	onSave,
	onDelete,
}: OrderListFilterPresetsProps): React.ReactNode {
	const t = useTranslations("OrderList");
	const [newName, setNewName] = useState("");
	const [isNaming, setIsNaming] = useState(false);

	function handleSave(): void {
		const name = newName.trim();
		if (!name) return;
		onSave(name);
		setNewName("");
		setIsNaming(false);
	}

	return (
		<Popover className="relative">
			{({ open, close }) => (
				<>
					<PopoverButton className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
						<Bookmark size={14} />
						{t("presetsLabel")}
					</PopoverButton>

					<AnimatedPopoverPanel
						open={open}
						className="absolute left-0 z-20 mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
						{presets.length === 0 ? (
							<p className="px-3 py-2 text-xs text-[#9CA3AF]">{t("presetsEmpty")}</p>
						) : (
							presets.map((preset) => (
								<div key={preset.id} className="flex items-center gap-1">
									<button
										onClick={() => {
											onApply(preset.value);
											close();
										}}
										className="min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
										{preset.name}
									</button>
									<button
										onClick={() => onDelete(preset.id)}
										aria-label={t("presetsDeleteAria", { name: preset.name })}
										className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-500">
										<X size={13} />
									</button>
								</div>
							))
						)}

						<div className="mx-1 my-1.5 h-px bg-[#E5E7EB]" />

						{isNaming ? (
							<div className="flex items-center gap-1 px-1 py-1">
								<input
									autoFocus
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleSave();
										if (e.key === "Escape") setIsNaming(false);
									}}
									placeholder={t("presetsNamePlaceholder")}
									className="focus:border-imsg-blue min-w-0 flex-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs outline-none"
								/>
								<button
									onClick={handleSave}
									disabled={!newName.trim()}
									className={cn(
										"flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors",
										newName.trim()
											? "text-imsg-blue hover:bg-[#EFF6FF]"
											: "cursor-not-allowed text-[#D1D5DB]",
									)}>
									<Check size={14} />
								</button>
							</div>
						) : (
							<button
								onClick={() => setIsNaming(true)}
								className="text-imsg-blue flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-[#EFF6FF]">
								<Plus size={13} />
								{t("presetsSaveCurrent")}
							</button>
						)}
					</AnimatedPopoverPanel>
				</>
			)}
		</Popover>
	);
}
