"use client";

import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function AlertBanner() {
	const [isDismissed, setIsDismissed] = useState(false);

	if (isDismissed) return null;

	return (
		<div className="bg-indigo-50 border border-indigo-200/60 rounded-lg p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300">
			<div className="flex items-center gap-3">
				<p className="font-semibold text-indigo-900 text-sm">입찰 대기 중 (낙찰 선정 필요)</p>
				<span className="text-indigo-700 text-sm">5개의 입찰 대기</span>
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap">
					지금 선정하기
					<ArrowRight size={16} />
				</button>
				<button
					onClick={() => setIsDismissed(true)}
					className="text-indigo-600/50 hover:text-indigo-600 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors shrink-0">
					<X size={18} />
				</button>
			</div>
		</div>
	);
}