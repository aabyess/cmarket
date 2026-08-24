"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import type { ContractFilter } from "@/features/contract/types";

type ContractListTabsProps = {
	value: ContractFilter;
	counts: Record<ContractFilter, number>;
	onChange: (value: ContractFilter) => void;
	search: string;
	onSearchChange: (value: string) => void;
};

const TAB_VALUES: ContractFilter[] = ["all", "ongoing", "completed", "cancelled"];

export function ContractListTabs({
	value,
	counts,
	onChange,
	search,
	onSearchChange,
}: ContractListTabsProps): React.JSX.Element {
	const t = useTranslations("ContractListTabs");
	const tabLabels: Record<ContractFilter, string> = {
		all: t("tabAll"),
		ongoing: t("tabOngoing"),
		completed: t("tabCompleted"),
		cancelled: t("tabCancelled"),
	};

	return (
		<div className="border-hairline flex flex-wrap items-center gap-1 rounded-xl border bg-white p-1">
			{TAB_VALUES.map((tabValue) => {
				const isActive = value === tabValue;
				return (
					<button
						key={tabValue}
						type="button"
						onClick={() => onChange(tabValue)}
						className={cn(
							"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
							isActive ? "bg-imsg-blue text-white" : "text-[#374151] hover:bg-[#F9FAFB]",
						)}>
						{tabLabels[tabValue]}
						<span className={cn("text-xs", isActive ? "text-white/70" : "text-subtle")}>
							{counts[tabValue]}
						</span>
					</button>
				);
			})}

			<div className="bg-hairline mx-1 h-6 w-px" />

			<div className="flex items-center gap-2 px-2 py-1">
				<Search size={16} className="text-subtle shrink-0" />
				<input
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder={t("searchPlaceholder")}
					className="placeholder:text-subtle w-32 bg-transparent text-sm leading-none outline-none"
				/>
			</div>
		</div>
	);
}
