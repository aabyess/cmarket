// features/shared/components/DashboardCustomizeBar/index.tsx
"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Check, Pencil, Plus } from "lucide-react";

type HiddenWidget = {
	key: string;
	label: string;
};

type DashboardCustomizeBarProps = {
	isEditing: boolean;
	onToggleEditing: () => void;
	hiddenWidgets: HiddenWidget[];
	onShowWidget: (key: string) => void;
	onResetHidden: () => void;
};

// 대시보드 편집 모드 진입 버튼 + 숨긴 위젯을 다시 보이게 하는 칩 목록. 위젯 이름은
// 이미 각 대시보드에 있는 섹션 제목 번역을 그대로 넘겨받아 쓰므로 여기서 새로
// 번역하지 않는다.
// 편집 진입 버튼은 편집 모드가 아닐 때만 단독으로 뜨고, 편집 모드에 들어가면
// 숨긴 위젯 박스 안, "전체 초기화" 옆으로 자리를 옮긴다(같은 버튼이 두 곳에
// 중복되지 않는다). 숨긴 위젯이 없어도 박스 자체는 편집 모드 동안 계속 보여야
// "완료" 버튼으로 나갈 수 있다.
export function DashboardCustomizeBar({
	isEditing,
	onToggleEditing,
	hiddenWidgets,
	onShowWidget,
	onResetHidden,
}: DashboardCustomizeBarProps): React.ReactNode {
	const t = useTranslations("DashboardCustomizeBar");

	return (
		<div className="mb-6">
			{!isEditing && (
				<div className="flex justify-end">
					<button
						type="button"
						onClick={onToggleEditing}
						className="hover:bg-imsg-surface border-hairline flex items-center gap-1.5 rounded-full border bg-white px-3.5 py-2 text-xs font-medium text-[#374151] transition-colors">
						<Pencil size={13} />
						{t("editButton")}
					</button>
				</div>
			)}

			<AnimatePresence initial={false}>
				{isEditing && (
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.15 }}
						className="border-hairline flex flex-wrap items-center gap-2 rounded-2xl border border-dashed bg-white p-3">
						{hiddenWidgets.length > 0 && (
							<>
								<span className="text-imsg-secondary text-xs font-medium">
									{t("hiddenWidgetsLabel")}
								</span>
								{hiddenWidgets.map((widget) => (
									<button
										key={widget.key}
										type="button"
										onClick={() => onShowWidget(widget.key)}
										className="bg-imsg-surface hover:bg-hairline flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[#374151] transition-colors">
										<Plus size={11} />
										{widget.label}
									</button>
								))}
								<button
									type="button"
									onClick={onResetHidden}
									className="text-imsg-secondary text-xs font-medium underline-offset-2 hover:text-[#374151] hover:underline">
									{t("resetAllButton")}
								</button>
							</>
						)}
						<button
							type="button"
							onClick={onToggleEditing}
							className="border-imsg-blue bg-imsg-blue ml-auto flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium text-white transition-colors">
							<Check size={13} />
							{t("doneButton")}
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
