"use client";

import { ShieldCheck, TrendingDown, Users } from "lucide-react";

const TRUST_ITEMS = [
	{
		key: "verified",
		icon: ShieldCheck,
		label: "검증된 공급기업",
		value: "340곳",
		hint: "사업자 서류 확인 완료",
	},
	{
		key: "savings",
		icon: TrendingDown,
		label: "지난달 평균 절감액",
		value: "Rp 7.5jt",
		hint: "발주기관 기준",
	},
	{
		key: "response",
		icon: Users,
		label: "평균 견적 도착",
		value: "2~3일",
		hint: "공고 등록 후",
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