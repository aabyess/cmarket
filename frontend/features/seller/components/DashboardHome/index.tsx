"use client";

import { useRouter } from "next/navigation";
import { Search, FileText, Send, CheckCircle2, FileCheck, ArrowRight, Bell, MessageSquare, Building2 } from "lucide-react";
import type { OpenListing, SellerDashboardData } from "@/features/seller/types";

type DashboardHomeProps = {
	companyName: string;
	data: SellerDashboardData;
	recommendedListings: OpenListing[];
};

export function DashboardHome({ companyName, data, recommendedListings }: DashboardHomeProps) {
	const router = useRouter();

	function handleNavigate(href: string) {
		router.push(href);
	}

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-6xl px-6 py-8">

				{/* Welcome */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<p className="text-[13px] font-medium text-imsg-secondary">환영합니다 👋</p>
						<h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#0f172a]">
							{companyName}
						</h1>
					</div>
					<button
						onClick={() => handleNavigate("/seller/listing-browse")}
						className="flex items-center gap-1.5 rounded-full bg-imsg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-600 active:scale-95"
					>
						<Search size={15} strokeWidth={2.5} />
						견적요청 탐색
					</button>
				</div>

				{/* Stat Cards */}
				<div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
					{[
						{
							label: "견적요청 중인 건",
							value: `${data.openListingCount}건`,
							icon: FileText,
							iconBg: "bg-blue-50",
							iconColor: "text-imsg-blue",
						},
						{
							label: "보낸 견적",
							value: `${data.quoteCount}건`,
							icon: Send,
							iconBg: "bg-amber-50",
							iconColor: "text-amber-500",
						},
						{
							label: "계약 확정",
							value: `${data.awardedQuoteCount}건`,
							icon: CheckCircle2,
							iconBg: "bg-emerald-50",
							iconColor: "text-emerald-500",
						},
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
						>
							<span className={`flex size-9 items-center justify-center rounded-xl ${stat.iconBg}`}>
								<stat.icon size={17} className={stat.iconColor} />
							</span>
							<p className="mt-4 text-[28px] font-bold tracking-tight text-[#0f172a]">
								{stat.value}
							</p>
							<p className="mt-0.5 text-[12px] text-imsg-secondary">{stat.label}</p>
						</div>
					))}
				</div>

				{/* Two Column */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
					{/* 추천 공고 */}
					<div className="lg:col-span-2">
						<div className="rounded-2xl bg-white shadow-sm">
							<div className="flex items-center justify-between px-5 py-4">
								<div className="flex items-center gap-2">
									<h2 className="text-[15px] font-semibold text-[#0f172a]">추천 견적</h2>
									{recommendedListings.length > 0 && (
										<span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-imsg-blue">
											{recommendedListings.length}건
										</span>
									)}
								</div>
								<button
									onClick={() => handleNavigate("/seller/listing-browse")}
									className="text-[13px] font-medium text-imsg-blue hover:underline"
								>
									전체 견적 보기
								</button>
							</div>

							<div className="h-px bg-[#F2F2F7]" />

							{recommendedListings.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
										<Search size={20} className="text-imsg-secondary" />
									</div>
									<p className="text-[14px] font-medium text-[#0f172a]">추천할 견적이 없어요</p>
									<p className="mt-1 text-[12px] text-imsg-secondary">
										기업 프로필에서 취급 카테고리를 설정하면 맞춤 견적을 추천해드려요.
									</p>
									<button
										onClick={() => handleNavigate("/seller/profile/edit")}
										className="mt-4 rounded-full border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-imsg-surface"
									>
										프로필 편집하기
									</button>
								</div>
							) : (
								<ul>
									{recommendedListings.map((listing, i) => (
										<li
											key={listing.id}
											className={i !== recommendedListings.length - 1 ? "border-b border-[#F2F2F7]" : ""}
										>
											<button
												onClick={() => handleNavigate(`/seller/listing-browse/${listing.id}`)}
												className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-imsg-surface"
											>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-imsg-blue">
															내 취급 카테고리
														</span>
														<h3 className="truncate text-[14px] font-semibold text-[#0f172a]">
															{listing.title}
														</h3>
													</div>
													<p className="mt-0.5 text-[12px] text-imsg-secondary">
														{listing.deliveryProvinsi} {listing.deliveryCity} · 마감 {new Date(listing.endDate).toLocaleDateString("ko-KR")}
													</p>
												</div>
												<ArrowRight size={15} className="shrink-0 text-imsg-secondary" />
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
							<h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-imsg-secondary">
								바로가기
							</h2>
							<div className="grid grid-cols-2 gap-2">
								{[
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
								].map((link) => (
									<button
										key={link.label}
										onClick={() => handleNavigate(link.href)}
										className="flex flex-col gap-2.5 rounded-xl bg-imsg-surface p-3 text-left transition-colors hover:bg-[#E5E7EB]"
									>
										<span className={`flex size-8 items-center justify-center rounded-lg ${link.iconBg}`}>
											<link.icon size={16} className={link.color} />
										</span>
										<span>
											<span className="block text-[13px] font-semibold text-[#0f172a]">
												{link.label}
											</span>
											<span className="block text-[11px] text-imsg-secondary">{link.sub}</span>
										</span>
									</button>
								))}
							</div>
						</div>

						{/* 기업 프로필 유도 */}
						<div className="rounded-2xl bg-white p-4 shadow-sm">
							<div className="flex items-start gap-3">
								<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
									<Building2 size={16} className="text-imsg-blue" />
								</span>
								<div className="min-w-0 flex-1">
									<p className="text-[13px] font-semibold text-[#0f172a]">기업 프로필 완성하기</p>
									<p className="mt-0.5 text-[12px] text-imsg-secondary">
										바이어에게 신뢰를 주는 첫걸음이에요
									</p>
									<button
										onClick={() => handleNavigate("/seller/profile/edit")}
										className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-imsg-blue hover:underline"
									>
										프로필 편집하기
										<ArrowRight size={11} />
									</button>
								</div>
							</div>
						</div>

						{/* 최근 활동 */}
						<div className="rounded-2xl bg-white shadow-sm">
							<div className="px-4 py-3">
								<h2 className="text-[13px] font-semibold uppercase tracking-wider text-imsg-secondary">
									최근 활동
								</h2>
							</div>
							<div className="h-px bg-[#F2F2F7]" />
							<ul className="p-2">
								{data.activities.length === 0 ? (
									<li className="py-8 text-center text-[13px] text-imsg-secondary">
										아직 활동이 없어요
									</li>
								) : (
									data.activities.map((activity, i) => (
										<li
											key={i}
											className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-imsg-surface"
										>
											<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
												<Bell size={12} className="text-imsg-blue" />
											</span>
											<div className="min-w-0 flex-1">
												<p className="text-[13px] text-[#0f172a]">{activity.title}</p>
												<p className="mt-0.5 text-[11px] text-imsg-secondary">{activity.timeText}</p>
											</div>
										</li>
									))
								)}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}