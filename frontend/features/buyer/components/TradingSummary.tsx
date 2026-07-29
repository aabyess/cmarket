"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";

type SummaryItem = {
	label: string;
	value: string;
};

type SummarySection = {
	title: string;
	mainValue: string;
	items: SummaryItem[];
};

const summaryData: SummarySection[] = [
	{
		title: "진행중",
		mainValue: "4건",
		items: [
			{ label: "견적", value: "0" },
			{ label: "공고", value: "4" },
		],
	},
	{
		title: "마감",
		mainValue: "48건",
		items: [
			{ label: "견적", value: "0" },
			{ label: "공고", value: "48" },
		],
	},
	{
		title: "총 계약건",
		mainValue: "33건",
		items: [
			{ label: "카드 결제 대기", value: "0" },
			{ label: "계산서 및 영수증", value: "8" },
		],
	},
];

export function TradingSummary(){
	const [dateRange] = useState("26.07.01 (수) - 26.07.31 (금)");

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-bold text-[#1F2937]">나의 거래 요약</h2>
				<div className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm text-[#6B7280]">
					<Calendar size={16} />
					<span>{dateRange}</span>
				</div>
			</div>

			<div className="bg-white border border-[#E5E7EB] rounded-lg p-8 shadow-sm">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{summaryData.map((section, idx) => (
						<div
							key={idx}
							className="flex flex-col gap-4 border-r border-[#E5E7EB] last:border-r-0 pr-8 last:pr-0">
							<div>
								<p className="text-[#6B7280] text-sm font-medium mb-1">{section.title}</p>
								<p className="text-3xl font-bold text-indigo-600">{section.mainValue}</p>
							</div>
							<div className="space-y-2">
								{section.items.map((item, itemIdx) => (
									<div key={itemIdx} className="flex items-center justify-between">
										<span className="text-[#9CA3AF] text-sm">{item.label}</span>
										<span className="font-medium text-[#374151]">{item.value}</span>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}