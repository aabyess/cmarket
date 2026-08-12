"use client";

import { Globe, Zap, Receipt } from "lucide-react";

const TRUST_ITEMS = [
	{
		key: "market",
		icon: Globe,
		label: "인도네시아 발주기관",
		value: "1,200곳",
		hint: "사업자 서류 확인 완료",
	},
	{
		key: "speed",
		icon: Zap,
		label: "평균 계약 확정 소요",
		value: "3~5일",
		hint: "견적 제출 후",
	},
	{
		key: "fee",
		icon: Receipt,
		label: "견적 제출 수수료",
		value: "무료",
		hint: "계약 확정 시에만 정산",
	},
];

export function DashboardHomeTrustPanel() {
	return (
		<div className="rounded-2xl border border-[#E5E7EB] bg-white p-3.5">
			<p className="mb-3 text-xs font-medium text-[#1F2937]">MitraPay는 이런 곳이에요</p>

			{TRUST_ITEMS.map((item, index) => (
				<div
					key={item.key}
					className={`flex gap-2.5 ${
						index < TRUST_ITEMS.length - 1 ? "border-b border-[#E5E7EB] pb-3" : ""
					} ${index > 0 ? "pt-3" : ""}`}
				>
					<item.icon size={16} className="mt-0.5 shrink-0 text-[#3B82F6]" />
					<div className="min-w-0">
						<p className="text-xs text-[#6B7280]">{item.label}</p>
						<p className="text-sm font-medium text-[#1F2937]">{item.value}</p>
						<p className="text-xs text-[#9CA3AF]">{item.hint}</p>
					</div>
				</div>
			))}
		</div>
	);
}