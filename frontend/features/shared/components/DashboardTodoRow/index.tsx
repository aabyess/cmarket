// features/shared/components/DashboardTodoRow/index.tsx
"use client";

import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

const SPRING_TRANSITION = { type: "spring" as const, stiffness: 300, damping: 30 };

type DashboardTodoRowProps = {
	id: string;
	title: string;
	deadlineText: string | null;
	isUrgent: boolean;
	isNew?: boolean;
	urgentLabel: string;
	newLabel?: string;
	onClick: () => void;
	variant?: "row" | "card";
};

// 바이어/셀러 대시보드의 할 일 위젯이 같은 시각 언어를 쓰도록 항목 렌더링만 공유한다 —
// 데이터 형태와 액션 라우팅은 위젯마다 달라 그대로 둔다.
// 리스트(row)/카드(card) 전환은 같은 요소(key=id)가 계속 마운트된 채 클래스만 바뀌므로
// motion의 layout prop만으로 위치·크기 변화가 자동으로 애니메이션된다. layoutId는
// 필터링 등으로 항목이 다른 트리로 옮겨가는 경우를 대비한 여분의 안전장치다.
// reduced-motion 대응은 앱 루트의 MotionConfig(reducedMotion="user")가 처리한다.
export function DashboardTodoRow({
	id,
	title,
	deadlineText,
	isUrgent,
	isNew = false,
	urgentLabel,
	newLabel,
	onClick,
	variant = "row",
}: DashboardTodoRowProps): React.ReactNode {
	if (variant === "card") {
		return (
			<motion.li
				layout
				layoutId={`todo-${id}`}
				transition={SPRING_TRANSITION}
				onClick={onClick}
				className={cn(
					"hover:bg-imsg-surface flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 transition-colors",
					isUrgent ? "border-red-200 bg-red-50/40" : "border-[#F2F2F7]",
				)}>
				<div className="flex items-center gap-1.5">
					{isUrgent && (
						<span className="shrink-0 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-500">
							{urgentLabel}
						</span>
					)}
					{!isUrgent && isNew && newLabel && (
						<span className="text-imsg-blue shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold">
							{newLabel}
						</span>
					)}
				</div>
				<p className="truncate text-sm font-medium text-[#0f172a]">{title}</p>
				{deadlineText && (
					<p className={cn("text-xs", isUrgent ? "text-red-500" : "text-imsg-secondary")}>
						{deadlineText}
					</p>
				)}
			</motion.li>
		);
	}

	return (
		<motion.li
			layout
			layoutId={`todo-${id}`}
			transition={SPRING_TRANSITION}
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
		</motion.li>
	);
}
