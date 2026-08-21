// utils/modalMotion.ts
import type { Transition } from "motion/react";

// 모달 패널이 등장할 때 duration tween 대신 쓰는 스프링 — 튀지 않고 부드럽게 정착하도록
// damping을 stiffness 대비 높게 잡았다(ChatRoomPanel 도구 서랍의 400/26은 더 스냅감 있는
// UI용이라 모달에는 그대로 재사용하지 않는다).
const MODAL_PANEL_SPRING: Transition = { type: "spring", stiffness: 340, damping: 30 };

// prefers-reduced-motion이면 스프링 대신 기존 tween 정도의 짧은 duration으로 즉시 정착시킨다.
const MODAL_PANEL_REDUCED_MOTION: Transition = { duration: 0.15 };

export function getModalPanelTransition(prefersReducedMotion: boolean | null): Transition {
	return prefersReducedMotion ? MODAL_PANEL_REDUCED_MOTION : MODAL_PANEL_SPRING;
}
