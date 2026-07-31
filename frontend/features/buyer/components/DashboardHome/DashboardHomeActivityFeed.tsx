"use client";

import { Mail, FileText, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BuyerActivity, BuyerActivityType } from "@/features/buyer/types";

const ACTIVITY_ICON_MAP: Record<BuyerActivityType, { icon: LucideIcon; color: string }> = {
	quote: { icon: Mail, color: "text-[#3B82F6]" },
	document: { icon: FileText, color: "text-[#6B7280]" },
	completed: { icon: Check, color: "text-[#059669]" },
};

type DashboardHomeActivityFeedProps = {
	activities: BuyerActivity[];
	onViewAll: () => void;
};

export function DashboardHomeActivityFeed({
	activities,
	onViewAll,
}: DashboardHomeActivityFeedProps) {
	if (activities.length === 0) return null;

	return (
		<div className="mt-2 rounded-2xl border border-[#E5E7EB] bg-white p-3.5">
			<div className="mb-2.5 flex items-center justify-between">
				<p className="text-[13px] font-medium text-[#1F2937]">최근 활동</p>
				<button
					onClick={onViewAll}
					className="text-[11px] text-[#6B7280] transition-colors hover:text-[#374151]"
				>
					전체
				</button>
			</div>

			{activities.map((activity, index) => {
				const { icon: Icon, color } = ACTIVITY_ICON_MAP[activity.type];

				return (
					<div
						key={activity.id}
						className={`flex gap-2.5 ${
							index < activities.length - 1 ? "border-b border-[#E5E7EB] pb-2.5" : ""
						} ${index > 0 ? "pt-2.5" : ""}`}
					>
						<Icon size={15} className={`mt-0.5 shrink-0 ${color}`} />
						<div className="min-w-0">
							<p className="truncate text-xs leading-snug text-[#1F2937]">{activity.title}</p>
							<p className="truncate text-[11px] text-[#9CA3AF]">{activity.timeText}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}