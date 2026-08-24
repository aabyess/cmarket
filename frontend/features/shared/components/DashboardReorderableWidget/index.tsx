// features/shared/components/DashboardReorderableWidget/index.tsx
"use client";

import { Reorder, useDragControls } from "motion/react";
import { GripVertical } from "lucide-react";

type DashboardReorderableWidgetProps<K extends string> = {
	value: K;
	isEditing: boolean;
	dragHandleLabel: string;
	children: React.ReactNode;
};

// 편집 모드에서만 드래그로 순서를 바꿀 수 있게 하는 래퍼. 위젯 카드 안에 클릭 가능한
// 링크/버튼이 있어서 dragListener={false} + useDragControls로 좌상단 손잡이
// 아이콘에서만 드래그가 시작되게 한다(모션 공식 패턴) — 그래야 평소엔 카드 클릭이
// 그대로 동작한다.
export function DashboardReorderableWidget<K extends string>({
	value,
	isEditing,
	dragHandleLabel,
	children,
}: DashboardReorderableWidgetProps<K>): React.ReactNode {
	const dragControls = useDragControls();

	return (
		<Reorder.Item
			as="div"
			value={value}
			dragListener={false}
			dragControls={dragControls}
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ type: "spring", stiffness: 500, damping: 30 }}
			className="relative">
			{isEditing && (
				<button
					type="button"
					aria-label={dragHandleLabel}
					onPointerDown={(event) => dragControls.start(event)}
					className="text-imsg-secondary hover:bg-imsg-surface border-hairline absolute -top-2 -left-2 z-10 flex size-6 cursor-grab touch-none items-center justify-center rounded-full border bg-white shadow-sm transition-colors active:cursor-grabbing">
					<GripVertical size={13} />
				</button>
			)}
			{children}
		</Reorder.Item>
	);
}
