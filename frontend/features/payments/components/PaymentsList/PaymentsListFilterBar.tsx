"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { PAYMENT_FILTER_VALUES } from "@/features/payments/constants";
import type { PaymentFilter } from "@/features/payments/types";

type PaymentsListFilterBarProps = {
	search: string;
	onSearchChange: (value: string) => void;
	filter: PaymentFilter;
	onFilterChange: (value: PaymentFilter) => void;
};

export function PaymentsListFilterBar({
	search,
	onSearchChange,
	filter,
	onFilterChange,
}: PaymentsListFilterBarProps): React.ReactNode {
	const t = useTranslations("PaymentsList");
	const filterLabels: Record<PaymentFilter, string> = {
		all: t("filterAll"),
		awaitingReceipt: t("filterAwaitingReceipt"),
		awaitingConfirmation: t("filterAwaitingConfirmation"),
		confirmed: t("filterConfirmed"),
	};

	return (
		<div className="mb-4 flex flex-wrap items-center gap-2">
			<div className="border-hairline flex flex-wrap items-center gap-1 rounded-xl border bg-white p-1">
				{PAYMENT_FILTER_VALUES.map((value) => (
					<button
						key={value}
						onClick={() => onFilterChange(value)}
						className={cn(
							"flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
							filter === value ? "bg-imsg-blue text-white" : "text-[#374151] hover:bg-[#F9FAFB]",
						)}>
						{filterLabels[value]}
					</button>
				))}

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
		</div>
	);
}
