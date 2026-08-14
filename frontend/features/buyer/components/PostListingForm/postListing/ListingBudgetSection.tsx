"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import CalendarModal from "@/features/buyer/components/PostListingForm/postListing/CalendarModal";
import { cn } from "@/utils/cn";
import type { ListingFormData } from "@/features/buyer/types";

type ListingBudgetSectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingBudgetSection({ form, onChange }: ListingBudgetSectionProps) {
	const t = useTranslations("ListingBudgetSection");
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	return (
		<SectionWrapper
			title={t("title")}
			subtitle={t("subtitle")}
		>
			<div className="space-y-5">
				<div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-[#374151]">{t("budgetLabel")}</label>
						<div className="flex gap-1">
							<button
								onClick={() => onChange({ budgetPublic: false, currency: "IDR" })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									!form.budgetPublic
										? "bg-imsg-blue text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								{t("budgetPrivate")}
							</button>
							<button
								onClick={() => onChange({ budgetPublic: true, currency: "IDR" })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									form.budgetPublic
										? "bg-imsg-blue text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								{t("budgetPublic")}
							</button>
						</div>
					</div>

					{form.budgetPublic && (
						<div className="mt-3 flex items-center gap-2">
							<span className="text-sm text-[#6B7280]">Rp</span>
							<input
								type="text"
								inputMode="numeric"
								value={form.totalBudget ? form.totalBudget.toLocaleString("en-US") : ""}
								onChange={(e) => {
									const numeric = Number(e.target.value.replace(/[^0-9]/g, ""));
									onChange({ totalBudget: numeric });
								}}
								placeholder={t("budgetPlaceholder")}
								className="flex-1 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
							/>
						</div>
					)}
				</div>

				<div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-[#374151]">{t("deadlineLabel")}</label>
						<div className="flex gap-1">
							<button
								onClick={() => onChange({ deliveryTimingMode: "negotiate", deliveryDeadlineDate: null })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									form.deliveryTimingMode === "negotiate"
										? "bg-imsg-blue text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								{t("negotiable")}
							</button>
							<button
								onClick={() => onChange({ deliveryTimingMode: "specific" })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									form.deliveryTimingMode === "specific"
										? "bg-imsg-blue text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								{t("specificSchedule")}
							</button>
						</div>
					</div>

					{form.deliveryTimingMode === "specific" && (
						<button
							onClick={() => setIsCalendarOpen(true)}
							className="mt-3 flex w-full items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#374151] transition-colors hover:bg-[#F9FAFB]"
						>
							<Calendar size={15} className="text-[#9CA3AF]" />
							{form.deliveryDeadlineDate ?? t("selectDeadline")}
						</button>
					)}
				</div>
			</div>

			<CalendarModal
				isOpen={isCalendarOpen}
				onClose={() => setIsCalendarOpen(false)}
				value={form.deliveryDeadlineDate}
				onSelect={(isoDate) => onChange({ deliveryDeadlineDate: isoDate })}
			/>
		</SectionWrapper>
	);
}