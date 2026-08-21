"use client";

import { useTranslations } from "next-intl";
import { Popover, PopoverButton } from "@headlessui/react";
import { Filter, Search } from "lucide-react";
import { AnimatedPopoverPanel } from "@/components/commons/AnimatedPopoverPanel";
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
		<div className="mb-4 space-y-3">
			<div className="relative">
				<Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-[#9CA3AF]" />
				<input
					type="text"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder={t("searchPlaceholder")}
					className="focus:border-imsg-blue focus:ring-imsg-blue w-full rounded-xl border border-[#E2E8F0] bg-white py-3.5 pr-4 pl-11 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:ring-1 focus:outline-none"
				/>
			</div>

			<div className="flex items-center justify-end">
				<Popover className="relative">
					{({ open }) => (
						<>
							<PopoverButton className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
								<Filter size={14} />
								{filterLabels[filter]}
							</PopoverButton>

							<AnimatedPopoverPanel
								open={open}
								className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg">
								<p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold text-[#9CA3AF]">
									{t("filterSectionLabel")}
								</p>
								{PAYMENT_FILTER_VALUES.map((value) => (
									<button
										key={value}
										type="button"
										onClick={() => onFilterChange(value)}
										className={cn(
											"w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors",
											filter === value
												? "text-imsg-blue bg-[#EFF6FF]"
												: "text-[#374151] hover:bg-[#F9FAFB]",
										)}>
										{filterLabels[value]}
									</button>
								))}
							</AnimatedPopoverPanel>
						</>
					)}
				</Popover>
			</div>
		</div>
	);
}
