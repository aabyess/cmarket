"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/utils/cn";

export type ViewMode = "grid" | "list";

type ViewModeToggleProps = {
	value: ViewMode;
	onChange: (mode: ViewMode) => void;
};

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps): React.ReactNode {
	return (
		// 필터 버튼(py-2 text-xs, 약 34px)과 같은 높이가 되도록 p-0.5 + size-7로 맞춘다.
		<div className="flex shrink-0 items-center gap-0.5 rounded-xl border border-[#E5E7EB] bg-white p-0.5">
			<button
				onClick={() => onChange("grid")}
				className={cn(
					"flex size-7 items-center justify-center rounded-lg transition-colors",
					value === "grid" ? "bg-imsg-blue text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
				)}
			>
				<LayoutGrid size={15} />
			</button>
			<button
				onClick={() => onChange("list")}
				className={cn(
					"flex size-7 items-center justify-center rounded-lg transition-colors",
					value === "list" ? "bg-imsg-blue text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
				)}
			>
				<List size={15} />
			</button>
		</div>
	);
}
