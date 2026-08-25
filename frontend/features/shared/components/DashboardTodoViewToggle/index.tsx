// features/shared/components/DashboardTodoViewToggle/index.tsx
"use client";

import { useTranslations } from "next-intl";
import { Calendar, List } from "lucide-react";
import { cn } from "@/utils/cn";

export type DashboardTodoViewMode = "list" | "agenda";

type DashboardTodoViewToggleProps = {
	value: DashboardTodoViewMode;
	onChange: (mode: DashboardTodoViewMode) => void;
};

// components/commons/ViewModeToggle와 같은 시각 톤(크기/색)을 쓰지만, 할일 위젯 전용
// list/agenda 두 모드라 공용 컴포넌트를 확장하는 대신 별도로 둔다 — ViewModeToggle은
// 공고목록/계약목록 등 다른 화면의 grid/list 전환에도 쓰여서 아이콘을 바꾸면 그쪽이 깨진다.
export function DashboardTodoViewToggle({
	value,
	onChange,
}: DashboardTodoViewToggleProps): React.ReactNode {
	const t = useTranslations("DashboardTodoViewToggle");

	return (
		<div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-[#E5E7EB] bg-white p-0.5">
			<button
				onClick={() => onChange("list")}
				aria-label={t("listLabel")}
				aria-pressed={value === "list"}
				className={cn(
					"flex size-7 items-center justify-center rounded-lg transition-colors",
					value === "list" ? "bg-imsg-blue text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
				)}>
				<List size={15} />
			</button>
			<button
				onClick={() => onChange("agenda")}
				aria-label={t("agendaLabel")}
				aria-pressed={value === "agenda"}
				className={cn(
					"flex size-7 items-center justify-center rounded-lg transition-colors",
					value === "agenda" ? "bg-imsg-blue text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
				)}>
				<Calendar size={15} />
			</button>
		</div>
	);
}
