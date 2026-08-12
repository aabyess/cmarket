"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Bell, Building2, Clock, MessageSquare, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import type { OpenListing, SellerDashboardData } from "@/features/seller/types";

type DashboardHomeProps = {
	companyName: string;
	data: SellerDashboardData;
	recommendedListings: OpenListing[];
};

export function DashboardHome({
	companyName,
	data,
	recommendedListings,
}: DashboardHomeProps): React.JSX.Element {
	const router = useRouter();

	function handleNavigate(href: string): void {
		router.push(href);
	}

	const summaryBlocks = [
		{
			label: "견적요청",
			total: data.openListingCount,
			subItems: [{ label: "내 카테고리 추천", value: `${recommendedListings.length}건` }],
		},
		{
			label: "보낸 견적",
			total: data.quoteCount,
			subItems: [
				{ label: "검토 대기", value: `${data.pendingQuoteCount}건` },
				{ label: "낙찰", value: `${data.awardedQuoteCount}건` },
			],
		},
		{
			label: "계약",
			total: data.contractCount,
			subItems: [{ label: "낙찰된 견적", value: `${data.awardedQuoteCount}건` }],
		},
	];

	const quickLinks = [
		{
			label: "견적 탐색",
			sub: `${data.openListingCount}건`,
			icon: Search,
			iconBg: "bg-blue-50",
			color: "text-imsg-blue",
			href: "/seller/listing-browse",
		},
		{
			label: "채팅",
			sub: "확인하기",
			icon: MessageSquare,
			iconBg: "bg-amber-50",
			color: "text-amber-500",
			href: "/seller/chat",
		},
	];

	return (
		<div className="mx-auto max-w-[1200px] px-2 py-6 xl:px-0.5">
			{/* 배너 */}
			<div className="mb-6 flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-8 py-7">
				<div>
					<p className="text-sm font-medium text-imsg-secondary">MitraPay</p>
					<h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0f172a]">
						{companyName}님, 환영합니다
					</h1>
				</div>
				<button
					onClick={() => handleNavigate("/seller/listing-browse")}
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-imsg-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 active:scale-95">
					<Search size={15} strokeWidth={2.5} />
					견적요청 탐색
				</button>
			</div>

			{/* 나의 거래 요약 */}
			<div className="mb-6">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-base font-semibold text-[#0f172a]">나의 거래 요약</h2>
				</div>
				<div className="rounded-2xl bg-white p-6 shadow-sm">
					<div className="grid grid-cols-1 divide-y divide-[#F2F2F7] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
						{summaryBlocks.map((block) => (
							<div
								key={block.label}
								className="px-0 py-4 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0">
								<div className="flex items-baseline justify-between">
									<p className="text-sm font-medium text-imsg-secondary">{block.label}</p>
									<p className="text-3xl font-bold text-[#0f172a]">{block.total}건</p>
								</div>
								<div className="mt-3 space-y-2">
									{block.subItems.map((sub) => (
										<div key={sub.label} className="flex items-center justify-between text-sm">
											<span className="text-imsg-secondary">{sub.label}</span>
											<span className="font-medium text-[#0f172a]">{sub.value}</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Two Column */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* 추천 견적 */}
				<div className="lg:col-span-2">
					<div className="rounded-2xl bg-white shadow-sm">
						<div className="flex items-center justify-between px-5 py-4">
							<div className="flex items-center gap-2">
								<h2 className="text-base font-semibold text-[#0f172a]">추천 견적</h2>
								{recommendedListings.length > 0 && (
									<span className="rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold text-imsg-blue">
										{recommendedListings.length}건
									</span>
								)}
							</div>
							<button
								onClick={() => handleNavigate("/seller/listing-browse")}
								className="text-sm font-medium text-imsg-blue hover:underline">
								모두 보기
							</button>
						</div>

						<div className="h-px bg-[#F2F2F7]" />

						{recommendedListings.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
									<Search size={20} className="text-imsg-secondary" />
								</div>
								<p className="text-base font-medium text-[#0f172a]">추천할 견적이 없어요</p>
								<p className="mt-1 text-sm text-imsg-secondary">
									거래 설정에서 취급 카테고리를 지정하면 맞춤 견적을 추천해드려요.
								</p>
								<button
									onClick={() => handleNavigate("/seller/profile/edit?tab=settings")}
									className="mt-4 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors hover:bg-imsg-surface">
									취급 카테고리 설정하기
								</button>
							</div>
						) : (
							<ul>
								{recommendedListings.map((listing, i) => (
									<li
										key={listing.id}
										className={cn(
											"flex items-start gap-4 border-l-2 border-l-imsg-blue px-5 py-4 transition-colors hover:bg-imsg-surface",
											i !== recommendedListings.length - 1 && "border-b border-b-[#F2F2F7]",
										)}>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<h3 className="truncate text-base font-semibold text-[#0f172a]">
													{listing.title}
												</h3>
												<span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold text-imsg-blue">
													내 취급 카테고리
												</span>
											</div>
											<p className="mt-0.5 text-sm text-imsg-secondary">
												{[listing.deliveryProvinsi, listing.deliveryCity].filter(Boolean).join(" ")}
											</p>
											<div className="mt-1.5 flex items-center gap-1 text-sm text-imsg-secondary">
												<Clock size={11} />
												<span>마감 {new Date(listing.endDate).toLocaleDateString("ko-KR")}</span>
											</div>
										</div>
										<button
											onClick={() => handleNavigate(`/seller/listing-browse/${listing.id}`)}
											className="flex shrink-0 items-center gap-1 rounded-full bg-imsg-surface px-3.5 py-1.5 text-sm font-semibold text-[#0f172a] transition-colors hover:bg-[#E5E7EB]">
											견적 보내기
											<ArrowRight size={12} />
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				{/* Side */}
				<div className="space-y-4">
					{/* 바로가기 */}
					<div className="rounded-2xl bg-white p-4 shadow-sm">
						<h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-imsg-secondary">
							바로가기
						</h2>
						<div className="grid grid-cols-2 gap-2">
							{quickLinks.map((link) => (
								<button
									key={link.label}
									onClick={() => handleNavigate(link.href)}
									className="flex flex-col gap-2.5 rounded-xl bg-imsg-surface p-3 text-left transition-colors hover:bg-[#E5E7EB]">
									<span
										className={cn("flex size-8 items-center justify-center rounded-lg", link.iconBg)}>
										<link.icon size={16} className={link.color} />
									</span>
									<span>
										<span className="block text-sm font-semibold text-[#0f172a]">{link.label}</span>
										<span className="block text-sm text-imsg-secondary">{link.sub}</span>
									</span>
								</button>
							))}
						</div>
					</div>

					{/* 기업 홈페이지 유도 */}
					<div className="rounded-2xl bg-white p-4 shadow-sm">
						<div className="flex items-start gap-3">
							<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
								<Building2 size={16} className="text-imsg-blue" />
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold text-[#0f172a]">기업 홈페이지 만들기</p>
								<p className="mt-0.5 text-sm text-imsg-secondary">
									바이어에게 신뢰를 주는 첫걸음이에요
								</p>
								<button
									onClick={() => handleNavigate("/seller/profile/edit")}
									className="mt-2 flex items-center gap-1 text-sm font-semibold text-imsg-blue hover:underline">
									홈페이지 편집하기
									<ArrowRight size={11} />
								</button>
							</div>
						</div>
					</div>

					{/* 최근 활동 */}
					<div className="rounded-2xl bg-white shadow-sm">
						<div className="flex items-center gap-2 px-4 py-3">
							<h2 className="text-sm font-semibold uppercase tracking-wider text-imsg-secondary">
								최근 활동
							</h2>
						</div>
						<div className="h-px bg-[#F2F2F7]" />
						<ul className="p-2">
							{data.activities.length === 0 ? (
								<li className="py-8 text-center text-sm text-imsg-secondary">아직 활동이 없어요</li>
							) : (
								data.activities.map((activity, i) => (
									<li
										key={i}
										className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-imsg-surface">
										<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
											<Bell size={12} className="text-imsg-blue" />
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-sm text-[#0f172a]">{activity.title}</p>
											<p className="mt-0.5 text-sm text-imsg-secondary">{activity.timeText}</p>
										</div>
									</li>
								))
							)}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
