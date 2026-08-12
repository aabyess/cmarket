"use client";

import { cva } from "class-variance-authority";
import type { ContractFilter } from "@/features/contract/types";

type ContractListTabsProps = {
	value: ContractFilter;
	counts: Record<ContractFilter, number>;
	onChange: (value: ContractFilter) => void;
};

const TABS: { value: ContractFilter; label: string }[] = [
	{ value: "all", label: "전체" },
	{ value: "ongoing", label: "진행 중" },
	{ value: "completed", label: "계약 완료" },
];

const tab = cva("flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200", {
	variants: {
		active: {
			true: "bg-[#EFF6FF] text-imsg-blue",
			false: "text-imsg-secondary hover:bg-gray-50",
		},
	},
	defaultVariants: { active: false },
});

const countChip = cva("rounded-full px-1.5 py-0.5 text-xs font-semibold", {
	variants: {
		active: {
			true: "bg-imsg-blue text-white",
			false: "bg-imsg-surface text-imsg-secondary",
		},
	},
	defaultVariants: { active: false },
});

export function ContractListTabs({
	value,
	counts,
	onChange,
}: ContractListTabsProps): React.JSX.Element {
	return (
		<div className="mb-4 flex gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
			{TABS.map((item) => (
				<button
					key={item.value}
					type="button"
					onClick={() => onChange(item.value)}
					className={tab({ active: value === item.value })}>
					{item.label}
					<span className={countChip({ active: value === item.value })}>{counts[item.value]}</span>
				</button>
			))}
		</div>
	);
}
