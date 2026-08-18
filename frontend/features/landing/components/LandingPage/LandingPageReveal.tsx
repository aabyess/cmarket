// features/landing/components/LandingPage/LandingPageReveal.tsx
"use client";

import { motion, MotionConfig } from "motion/react";

type LandingPageRevealProps = {
	children: React.ReactNode;
	delay?: number;
	className?: string;
};

/** 스크롤로 섹션이 보일 때 한 번만 부드럽게 떠오르는 래퍼 */
export function LandingPageReveal({
	children,
	delay = 0,
	className,
}: LandingPageRevealProps): React.JSX.Element {
	return (
		<MotionConfig reducedMotion="user">
			<motion.div
				className={className}
				initial={{ opacity: 0, y: 16 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-64px" }}
				transition={{ duration: 0.45, delay, ease: "easeOut" }}>
				{children}
			</motion.div>
		</MotionConfig>
	);
}
