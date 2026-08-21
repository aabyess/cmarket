// components/layout/sidebarTransition.ts
import type { Transition } from "motion/react";

// 사이드바 폭(aside)과 본문 여백(AppShell)이 서로 다른 곳에서 CSS transition을 걸다 보니
// duration이 어긋나면 둘이 따로 움직이는 것처럼 보인다. 값을 한 곳에서만 관리한다.
export const SIDEBAR_TRANSITION_CLASS = "duration-[260ms] ease-in-out motion-reduce:duration-0";

// 아이콘 위치 이동(layout) 등 motion 쪽 애니메이션도 같은 타이밍을 쓴다. 바운스 없이
// 부드럽게 정착하도록 spring 대신 tween을 쓴다.
export function getSidebarLayoutTransition(prefersReducedMotion: boolean | null): Transition {
	return prefersReducedMotion ? { duration: 0 } : { duration: 0.26, ease: "easeInOut" };
}
