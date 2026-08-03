"use client";

import { useRouter } from "next/navigation";
import { DashboardHomeEmptyState } from "@/features/seller/components/DashboardHome/DashboardHomeEmptyState";
import { DashboardHomeTrustPanel } from "@/features/seller/components/DashboardHome/DashboardHomeTrustPanel";
import type { SellerDashboardData } from "@/features/seller/types";

type DashboardHomeProps = {
	companyName: string;
	data: SellerDashboardData;
};

export function DashboardHome({ companyName, data }: DashboardHomeProps) {
	const router = useRouter();

	function handleNavigate(href: string) {
		router.push(href);
	}

	return (
		<div className="w-full">
			<div className="mb-3.5">
				<p className="text-[17px] font-medium text-[#1F2937]">{companyName}</p>
				<p className="mt-px text-xs text-[#6B7280]">
					환영합니다 👋 · 첫 견적을 보내볼까요?
				</p>
			</div>

			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
				<DashboardHomeEmptyState
					openListingCount={data.openListingCount}
					onBrowseListings={() => handleNavigate("/seller/listing-browse")}
					onEditProfile={() => handleNavigate("/seller/profile/edit")}
				/>
				<DashboardHomeTrustPanel />
			</div>
		</div>
	);
}