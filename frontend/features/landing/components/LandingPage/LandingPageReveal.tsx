// features/landing/components/LandingPage/LandingPageReveal.tsx
import { cn } from "@/utils/cn";

type LandingPageRevealProps = {
	children: React.ReactNode;
	delay?: number;
	className?: string;
};

/** 스크롤로 섹션이 보일 때 부드럽게 떠오르는 래퍼 (CSS animation-timeline: view()) */
export function LandingPageReveal({
	children,
	delay = 0,
	className,
}: LandingPageRevealProps): React.JSX.Element {
	return (
		<div
			className={cn("landing-reveal", className)}
			style={delay ? { animationDelay: `${delay}s` } : undefined}>
			{children}
		</div>
	);
}
