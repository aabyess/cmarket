"use client";

import SectionWrapper from "@/features/buyer/components/postListing/SectionWrapper";
import PillSelector from "@/features/buyer/components/postListing/PillSelector";

const QUALIFICATIONS = [
	{ id: "reg-capital", label: "등록자본금" },
	{ id: "tech-cert", label: "기술인증" },
	{ id: "iso", label: "ISO 인증" },
	{ id: "min-employees", label: "최소 직원수" },
	{ id: "experience", label: "경력 증명" },
	{ id: "local", label: "지역 기업" },
];

const REGIONS = [
	{ id: "seoul", label: "서울" }, { id: "busan", label: "부산" }, { id: "daegu", label: "대구" },
	{ id: "incheon", label: "인천" }, { id: "gwangju", label: "광주" }, { id: "daejeon", label: "대전" },
	{ id: "ulsan", label: "울산" }, { id: "sejong", label: "세종" }, { id: "gyeonggi", label: "경기" },
	{ id: "gangwon", label: "강원" }, { id: "chungbuk", label: "충북" }, { id: "chungnam", label: "충남" },
	{ id: "jeonbuk", label: "전북" }, { id: "jeonnam", label: "전남" }, { id: "gyeongbuk", label: "경북" },
	{ id: "gyeongnam", label: "경남" }, { id: "jeju", label: "제주" },
];

interface BiddingConditionsSectionProps {
	formState: any;
	setFormState: (state: any) => void;
}

export default function BiddingConditionsSection({ formState, setFormState }: BiddingConditionsSectionProps) {
	const handleChange = (field: string, value: any) => {
		setFormState({ ...formState, biddingConditions: { ...formState.biddingConditions, [field]: value } });
	};

	const handleQuickDuration = (days: number) => {
		const start = new Date(formState.biddingConditions.startDate);
		const end = new Date(start);
		end.setDate(end.getDate() + days);
		handleChange("endDate", end.toISOString().slice(0, 16));
	};

	return (
		<SectionWrapper title="입찰 조건" subtitle="입찰 참여 자격과 기간을 설정하세요">
			<div className="space-y-8">
				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-4">참여 자격 조건 (중복선택 가능)</label>
					<PillSelector items={QUALIFICATIONS} selectedIds={formState.biddingConditions.qualifications} onChange={(v) => handleChange("qualifications", v)} />
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-4">지역 제한 (중복선택 가능)</label>
					<PillSelector items={REGIONS} selectedIds={formState.biddingConditions.regions} onChange={(v) => handleChange("regions", v)} />
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-4">공고 기간</label>
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label className="block text-xs text-gray-600 mb-2">시작일</label>
							<input type="datetime-local" value={formState.biddingConditions.startDate} onChange={(e) => handleChange("startDate", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
						</div>
						<div>
							<label className="block text-xs text-gray-600 mb-2">종료일</label>
							<input type="datetime-local" value={formState.biddingConditions.endDate} onChange={(e) => handleChange("endDate", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
						</div>
					</div>
					<div className="flex gap-2">
						<span className="text-xs text-gray-600 self-center">빠른 설정:</span>
						{[1, 3, 7, 14, 30].map((days) => (
							<button key={days} onClick={() => handleQuickDuration(days)} disabled={!formState.biddingConditions.startDate} className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors">
								{days}일
							</button>
						))}
					</div>
				</div>

				<div>
					<label className="block text-sm font-semibold text-gray-900 mb-3">제출 방식</label>
					<select value={formState.biddingConditions.submissionType} onChange={(e) => handleChange("submissionType", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
						<option value="sequential">순차 제출</option>
						<option value="sealed">밀봉 제출</option>
						<option value="combined">혼합 제출</option>
						<option value="open">공개 제출</option>
					</select>
				</div>
			</div>
		</SectionWrapper>
	);
}