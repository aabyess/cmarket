// features/shared/components/DashboardTodoRow/index.tsx
"use client";

import { motion } from "motion/react";
import { ChevronRight, X } from "lucide-react";
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
	/** 값이 있으면 항목 우측에 X 버튼을 노출해 이 화면에서만 항목을 숨길 수 있게 한다. */
	onDismiss?: () => void;
	dismissLabel?: string;
};

// 바이어/셀러 대시보드의 할 일 위젯(리스트뷰/아젠다뷰)이 같은 시각 언어를 쓰도록 항목
// 렌더링만 공유한다 — 데이터 형태와 액션 라우팅은 위젯마다 달라 그대로 둔다.
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
	onDismiss,
	dismissLabel,
}: DashboardTodoRowProps): React.ReactNode {
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
				<span className="shrink-0 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-xs font-semibold text-[#DC2626]">
					{urgentLabel}
				</span>
			)}
			{!isUrgent && isNew && newLabel && (
				<span className="text-imsg-blue shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold">
					{newLabel}
				</span>
			)}
			{deadlineText && (
				<span
					className={cn("shrink-0 text-xs", isUrgent ? "text-[#DC2626]" : "text-imsg-secondary")}>
					{deadlineText}
				</span>
			)}
			{onDismiss && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onDismiss();
					}}
					aria-label={dismissLabel}
					className="hover:bg-hairline flex shrink-0 items-center justify-center rounded-full p-1 text-[#9CA3AF] transition-colors hover:text-[#374151]">
					<X size={13} />
				</button>
			)}
			<ChevronRight size={14} className="shrink-0 text-[#D1D5DB]" />
		</motion.li>
	);
}
