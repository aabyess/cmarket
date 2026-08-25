// components/commons/Toast/index.tsx
"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useToastStore, type Toast as ToastItem } from "@/store/useToastStore";

const AUTO_DISMISS_MS = 3000;

const VARIANT_ICON = {
	success: CheckCircle2,
	error: AlertCircle,
} as const;

const VARIANT_ICON_COLOR = {
	success: "text-[#4ADE80]",
	error: "text-[#F87171]",
} as const;

function ToastCard({ id, message, variant }: ToastItem): React.ReactNode {
	const dismissToast = useToastStore((state) => state.dismissToast);

	// 3초 후 자동으로 사라진다 — 언마운트(예: 페이지 전환) 시 타이머도 함께 정리한다.
	useEffect(() => {
		const timer = setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
		return () => clearTimeout(timer);
	}, [id, dismissToast]);

	const Icon = VARIANT_ICON[variant];

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: -16, scale: 0.9 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -8, scale: 0.9 }}
			transition={{ type: "spring", stiffness: 400, damping: 30 }}
			className="flex items-center gap-2 rounded-full bg-[#1F2937]/90 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-md">
			<Icon size={16} className={VARIANT_ICON_COLOR[variant]} />
			{message}
		</motion.div>
	);
}

// 애플 스타일의 상단 중앙 알약형 토스트. prefers-reduced-motion 대응은 앱 루트의
// MotionConfig(reducedMotion="user")가 처리한다.
export function Toast(): React.ReactNode {
	const toasts = useToastStore((state) => state.toasts);

	return (
		<div className="pointer-events-none fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
			<AnimatePresence initial={false}>
				{toasts.map((toast) => (
					<ToastCard key={toast.id} {...toast} />
				))}
			</AnimatePresence>
		</div>
	);
}
