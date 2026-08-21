// components/commons/AnimatedPopoverPanel/index.tsx
"use client";

import { PopoverPanel } from "@headlessui/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getDropdownMotionProps } from "@/utils/dropdownMotion";

type AnimatedPopoverPanelProps = {
	/** 부모 <Popover>의 렌더 프롭 open 값을 그대로 넘긴다. */
	open: boolean;
	className?: string;
	children: React.ReactNode;
};

// PopoverPanel을 motion.div로 승격하고 static + 바깥의 {open && ...} 조건으로 감싸서,
// AnimatePresence가 닫힐 때의 exit 애니메이션까지 끝까지 재생할 수 있게 한다
// (Dialog static open={isOpen} + AnimatePresence와 같은 패턴, headlessui v2 공식 예제 방식).
export function AnimatedPopoverPanel({ open, className, children }: AnimatedPopoverPanelProps): React.ReactNode {
	const prefersReducedMotion = useReducedMotion();

	return (
		<AnimatePresence>
			{open && (
				<PopoverPanel static as={motion.div} className={className} {...getDropdownMotionProps(prefersReducedMotion)}>
					{children}
				</PopoverPanel>
			)}
		</AnimatePresence>
	);
}
