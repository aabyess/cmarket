"use client";

import { useState } from "react";
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
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	return (
		<SectionWrapper
			title="견적요청 조건"
			subtitle="예산과 희망 납기일을 설정해주세요"
		>
			<div className="space-y-5">
				<div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-[#374151]">예산</label>
						<div className="flex gap-1">
							<button
								onClick={() => onChange({ budgetPublic: false, currency: "IDR" })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									!form.budgetPublic
										? "bg-[#3B82F6] text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								예산 비공개
							</button>
							<button
								onClick={() => onChange({ budgetPublic: true, currency: "IDR" })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									form.budgetPublic
										? "bg-[#3B82F6] text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								예산 공개
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
								placeholder="예산 금액 (원)"
								className="flex-1 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
							/>
						</div>
					)}
				</div>

				<div>
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium text-[#374151]">희망 납기일</label>
						<div className="flex gap-1">
							<button
								onClick={() => onChange({ deliveryTimingMode: "negotiate", deliveryDeadlineDate: null })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									form.deliveryTimingMode === "negotiate"
										? "bg-[#3B82F6] text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								협의 가능
							</button>
							<button
								onClick={() => onChange({ deliveryTimingMode: "specific" })}
								className={cn(
									"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
									form.deliveryTimingMode === "specific"
										? "bg-[#3B82F6] text-white"
										: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
								)}
							>
								구체적 일정
							</button>
						</div>
					</div>

					{form.deliveryTimingMode === "specific" && (
						<button
							onClick={() => setIsCalendarOpen(true)}
							className="mt-3 flex w-full items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#374151] transition-colors hover:bg-[#F9FAFB]"
						>
							<Calendar size={15} className="text-[#9CA3AF]" />
							{form.deliveryDeadlineDate ?? "납기일을 선택해주세요"}
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