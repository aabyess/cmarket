// features/shared/components/DashboardWidgetPop/index.tsx
"use client";

import { AnimatePresence, motion } from "motion/react";

type DashboardWidgetPopProps = {
	show: boolean;
	className?: string;
	children: React.ReactNode;
};

// 대시보드 메인 영역 위젯을 숨기고/다시 보이게 할 때 scale+opacity로 스냅 팝
// 애니메이션을 준다. initial={false}로 페이지 최초 진입 시에는 재생하지 않고,
// 편집 모드에서 X 버튼/다시 보이기 칩으로 상태를 바꿀 때만 재생한다.
// prefers-reduced-motion은 앱 루트 MotionConfig(reducedMotion="user")가 처리한다.
// className은 grid 자식(lg:col-span-2 등)처럼 이 motion.div 자체에 붙어야 하는
// 레이아웃 클래스를 위한 것 — children 안쪽 div에 넣으면 grid에서 동작하지 않는다.
export function DashboardWidgetPop({
	show,
	className,
	children,
}: DashboardWidgetPopProps): React.ReactNode {
	return (
		<AnimatePresence initial={false}>
			{show && (
				<motion.div
					className={className}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.9 }}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
