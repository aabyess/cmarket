// features/landing/components/LandingPage/LandingPageReveal.tsx
"use client";

import { motion } from "motion/react";

type LandingPageRevealProps = {
	children: React.ReactNode;
	delay?: number;
};

/** 스크롤로 섹션이 보일 때 한 번만 부드럽게 떠오르는 래퍼 */
export function LandingPageReveal({
	children,
	delay = 0,
}: LandingPageRevealProps): React.JSX.Element {
	return (
		<motion.div
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.5, delay, ease: "easeOut" }}>
			{children}
		</motion.div>
	);
}
