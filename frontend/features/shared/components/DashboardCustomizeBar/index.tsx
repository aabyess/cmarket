// features/shared/components/DashboardCustomizeBar/index.tsx
"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Pencil, Plus } from "lucide-react";
import { cn } from "@/utils/cn";

type HiddenWidget = {
	key: string;
	label: string;
};

type DashboardCustomizeBarProps = {
	isEditing: boolean;
	onToggleEditing: () => void;
	hiddenWidgets: HiddenWidget[];
	onShowWidget: (key: string) => void;
};

// 대시보드 편집 모드 진입 버튼 + 숨긴 위젯을 다시 보이게 하는 칩 목록. 위젯 이름은
// 이미 각 대시보드에 있는 섹션 제목 번역을 그대로 넘겨받아 쓰므로 여기서 새로
// 번역하지 않는다.
export function DashboardCustomizeBar({
	isEditing,
	onToggleEditing,
	hiddenWidgets,
	onShowWidget,
}: DashboardCustomizeBarProps): React.ReactNode {
	const t = useTranslations("DashboardCustomizeBar");

	return (
		<div className="mb-6">
			<div className="flex justify-end">
				<button
					type="button"
					onClick={onToggleEditing}
					className={cn(
						"flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
						isEditing
							? "border-imsg-blue bg-imsg-blue text-white"
							: "border-[#E5E7EB] bg-white text-[#374151] hover:bg-imsg-surface",
					)}>
					{isEditing ? <Check size={13} /> : <Pencil size={13} />}
					{isEditing ? t("doneButton") : t("editButton")}
				</button>
			</div>

			<AnimatePresence initial={false}>
				{isEditing && hiddenWidgets.length > 0 && (
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-3">
						<span className="text-xs font-medium text-imsg-secondary">{t("hiddenWidgetsLabel")}</span>
						{hiddenWidgets.map((widget) => (
							<button
								key={widget.key}
								type="button"
								onClick={() => onShowWidget(widget.key)}
								className="flex items-center gap-1 rounded-full bg-imsg-surface px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors hover:bg-[#E5E7EB]">
								<Plus size={11} />
								{widget.label}
							</button>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
