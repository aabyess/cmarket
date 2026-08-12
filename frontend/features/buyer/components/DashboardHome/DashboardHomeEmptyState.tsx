"use client";

import { ClipboardPlus, Pencil, Mail, ThumbsUp, ChevronRight } from "lucide-react";

const ONBOARDING_STEPS = [
	{ key: "write", icon: Pencil, label: "1. 공고 작성", hint: "약 3분" },
	{ key: "receive", icon: Mail, label: "2. 견적 받기", hint: "보통 2~3일" },
	{ key: "select", icon: ThumbsUp, label: "3. 최고 조건 선택", hint: "AI가 비교 도와줘요" },
];

type DashboardHomeEmptyStateProps = {
	onCreateListing: () => void;
	onBrowseExamples: () => void;
};

export function DashboardHomeEmptyState({
	onCreateListing,
	onBrowseExamples,
}: DashboardHomeEmptyStateProps) {
	return (
		<div className="rounded-2xl border-2 border-[#3B82F6] bg-white p-5">
			<div className="mb-2.5 flex size-[30px] items-center justify-center rounded-[9px] bg-[#EFF6FF]">
				<ClipboardPlus size={16} className="text-[#3B82F6]" />
			</div>

			<p className="text-base font-medium leading-snug text-[#1F2937]">
				필요한 물품을 알려주세요
			</p>
			<p className="mt-1 text-xs text-[#6B7280]">
				공고를 올리면 한국 공급기업들이 견적을 보내드려요. 무료예요.
			</p>

			<div className="mt-3.5 flex items-start gap-1">
				{ONBOARDING_STEPS.map((step, index) => (
					<div key={step.key} className="flex flex-1 items-start gap-1">
						<div className="flex-1 rounded-[10px] bg-[#F9FAFB] px-3 py-2.5">
							<step.icon size={15} className="mb-1.5 text-[#3B82F6]" />
							<p className="text-xs font-medium text-[#374151]">{step.label}</p>
							<p className="text-xs text-[#9CA3AF]">{step.hint}</p>
						</div>
						{index < ONBOARDING_STEPS.length - 1 && (
							<ChevronRight size={14} className="mt-6 shrink-0 text-[#D1D5DB]" />
						)}
					</div>
				))}
			</div>

			<button
				onClick={onCreateListing}
				className="mt-3.5 w-full rounded-lg bg-[#3B82F6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
			>
				3분 만에 첫 공고 올리기
			</button>
			<button
				onClick={onBrowseExamples}
				className="mt-2 w-full py-1.5 text-xs text-[#6B7280] transition-colors hover:text-[#374151]"
			>
				다른 기업은 어떻게 쓰는지 구경하기
			</button>
		</div>
	);
}