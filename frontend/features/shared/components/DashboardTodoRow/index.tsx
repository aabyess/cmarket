// features/shared/components/DashboardTodoRow/index.tsx
"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

type DashboardTodoRowProps = {
	title: string;
	deadlineText: string | null;
	isUrgent: boolean;
	isNew?: boolean;
	urgentLabel: string;
	newLabel?: string;
	onClick: () => void;
};

// 바이어/셀러 대시보드의 할 일 위젯이 같은 시각 언어(한 줄 리스트, 긴급 좌측 보더)를
// 쓰도록 행 렌더링만 공유한다 — 데이터 형태와 액션 라우팅은 위젯마다 달라 그대로 둔다.
export function DashboardTodoRow({
	title,
	deadlineText,
	isUrgent,
	isNew = false,
	urgentLabel,
	newLabel,
	onClick,
}: DashboardTodoRowProps): React.ReactNode {
	return (
		<li
			onClick={onClick}
			className={cn(
				"hover:bg-imsg-surface flex cursor-pointer items-center gap-3 border-l-2 py-2.5 pr-5 pl-4 transition-colors",
				isUrgent ? "border-l-red-400" : "border-l-imsg-blue",
			)}>
			<span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0f172a]">{title}</span>
			{isUrgent && (
				<span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
					{urgentLabel}
				</span>
			)}
			{!isUrgent && isNew && newLabel && (
				<span className="text-imsg-blue shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold">
					{newLabel}
				</span>
			)}
			{deadlineText && (
				<span className={cn("shrink-0 text-xs", isUrgent ? "text-red-500" : "text-imsg-secondary")}>
					{deadlineText}
				</span>
			)}
			<ChevronRight size={14} className="shrink-0 text-[#D1D5DB]" />
		</li>
	);
}
