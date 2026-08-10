"use client";

import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import type { ListingFormData } from "@/features/buyer/types";

const QUICK_DAYS = [3, 7, 14, 30];

type ListingScheduleSectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingScheduleSection({ form, onChange }: ListingScheduleSectionProps) {
	function handleQuickDeadline(days: number) {
		const deadline = new Date();
		deadline.setDate(deadline.getDate() + days);
		onChange({ endDate: deadline.toISOString().slice(0, 16) });
	}

	return (
		<SectionWrapper title="일정" subtitle="견적 마감일과 희망 납품 기한을 정해주세요">
			<div className="space-y-5">
				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						견적 마감일 <span className="text-[#3B82F6]">*</span>
					</label>
					<input
						type="datetime-local"
						value={form.endDate}
						onChange={(e) => onChange({ endDate: e.target.value })}
						className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					/>
					<div className="mt-2 flex items-center gap-2">
						<span className="text-xs text-[#6B7280]">빠른 설정:</span>
						{QUICK_DAYS.map((days) => (
							<button
								key={days}
								onClick={() => handleQuickDeadline(days)}
								className="rounded bg-[#F3F4F6] px-3 py-1 text-xs text-[#374151] transition-colors hover:bg-[#E5E7EB]"
							>
								{days}일 후
							</button>
						))}
					</div>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">희망 납품 기한</label>
					<div className="flex items-center gap-2">
						<input
							type="number"
							min={1}
							value={form.deliveryDays || ""}
							onChange={(e) => onChange({ deliveryDays: Number(e.target.value) })}
							placeholder="예: 30"
							className="w-32 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
						/>
						<span className="text-sm text-[#6B7280]">일 이내 납품</span>
					</div>
					<p className="mt-1.5 text-xs text-[#9CA3AF]">
						한국-인도네시아 해상 운송은 보통 2~3주 소요됩니다.
					</p>
				</div>
			</div>
		</SectionWrapper>
	);
}