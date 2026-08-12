"use client";

import { Search, FileSearch, Send, Handshake, ChevronRight } from "lucide-react";

const ONBOARDING_STEPS = [
	{ key: "browse", icon: FileSearch, label: "1. 견적요청 찾기", hint: "관심 품목 검색" },
	{ key: "submit", icon: Send, label: "2. 견적 보내기", hint: "약 5분" },
	{ key: "win", icon: Handshake, label: "3. 계약 확정 & 거래", hint: "보통 3~5일" },
];

type DashboardHomeEmptyStateProps = {
	openListingCount: number;
	onBrowseListings: () => void;
	onEditProfile: () => void;
};

export function DashboardHomeEmptyState({
	openListingCount,
	onBrowseListings,
	onEditProfile,
}: DashboardHomeEmptyStateProps) {
	return (
		<div className="rounded-2xl border-2 border-[#3B82F6] bg-white p-5">
			<div className="mb-2.5 flex size-[30px] items-center justify-center rounded-[9px] bg-[#EFF6FF]">
				<Search size={16} className="text-[#3B82F6]" />
			</div>

			<p className="text-base font-medium leading-snug text-[#1F2937]">
				지금 <span className="text-[#3B82F6]">{openListingCount}건</span>의 견적요청이 열려 있어요
			</p>
			<p className="mt-1 text-xs text-[#6B7280]">
				인도네시아 발주기관들이 공급기업을 찾고 있어요. 견적은 무료입니다.
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
				onClick={onBrowseListings}
				className="mt-3.5 w-full rounded-lg bg-[#3B82F6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
			>
				열려 있는 견적요청 둘러보기
			</button>
			<button
				onClick={onEditProfile}
				className="mt-2 w-full py-1.5 text-xs text-[#6B7280] transition-colors hover:text-[#374151]"
			>
				먼저 기업 프로필부터 채우기
			</button>
		</div>
	);
}