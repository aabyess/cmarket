// utils/dropdownMotion.ts
import type { Transition } from "motion/react";

// 필터·정렬 드롭다운(Popover) 전반과 사이드바 프로필 드롭다운(headlessui가 아닌 순수
// div)이 같은 등장/퇴장 느낌을 쓰도록 값을 한 곳에서 관리한다 — modalMotion.ts와 같은 목적.
const ENTER_TRANSITION: Transition = { type: "spring", stiffness: 400, damping: 30 };
// 퇴장은 스프링이 아니라 짧은 tween으로 빠르게 사라지게 한다.
const EXIT_TRANSITION: Transition = { duration: 0.1 };
const REDUCED_MOTION_TRANSITION: Transition = { duration: 0 };

export function getDropdownMotionProps(prefersReducedMotion: boolean | null) {
	return {
		initial: prefersReducedMotion ? false : { opacity: 0, y: -6, scale: 0.98 },
		animate: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: prefersReducedMotion ? REDUCED_MOTION_TRANSITION : ENTER_TRANSITION,
		},
		exit: {
			opacity: 0,
			y: -4,
			scale: 0.98,
			transition: prefersReducedMotion ? REDUCED_MOTION_TRANSITION : EXIT_TRANSITION,
		},
	} as const;
}
