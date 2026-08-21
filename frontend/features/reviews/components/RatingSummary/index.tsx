import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

type RatingSummaryProps = {
	average: number | null;
	count: number;
	className?: string;
};

export function RatingSummary({ average, count, className }: RatingSummaryProps): React.ReactNode {
	if (count === 0 || average === null) return null;

	return (
		<span className={cn("inline-flex items-center gap-0.5 text-amber-600", className)}>
			<Star size={11} className="fill-amber-500 text-amber-500" />
			{average.toFixed(1)} ({count})
		</span>
	);
}
