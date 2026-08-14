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
		<div className="flex shrink-0 items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
			<button
				onClick={() => onChange("grid")}
				className={cn(
					"flex size-8 items-center justify-center rounded-lg transition-colors",
					value === "grid" ? "bg-[#3B82F6] text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
				)}
			>
				<LayoutGrid size={15} />
			</button>
			<button
				onClick={() => onChange("list")}
				className={cn(
					"flex size-8 items-center justify-center rounded-lg transition-colors",
					value === "list" ? "bg-[#3B82F6] text-white" : "text-[#9CA3AF] hover:bg-[#F9FAFB]",
				)}
			>
				<List size={15} />
			</button>
		</div>
	);
}
