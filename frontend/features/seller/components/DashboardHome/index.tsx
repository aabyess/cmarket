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
		<div className="min-h-screen bg-[#f8fafc]">
			<div className="mx-auto max-w-7xl px-6 py-8">

				{/* Welcome */}
				<div className="mb-6 flex items-end justify-between">
					<div>
						<p className="text-sm font-medium text-[#3B82F6]">환영합니다 👋</p>
						<h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0f172a]">
							{companyName}
						</h1>
					</div>
					<button
						onClick={() => handleNavigate("/seller/listing-browse")}
						className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2563EB]"
					>
						<Search size={16} strokeWidth={2.5} />
						공고 탐색
					</button>
				</div>

				{/* Stat Cards */}
				<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{[
						{ label: "공고 중인 건", value: `${data.openListingCount}건`, icon: FileText, tint: "bg-[#eff6ff]", iconColor: "text-[#3B82F6]" },
						{ label: "보낸 견적", value: `${data.quoteCount}건`, icon: Send, tint: "bg-[#fffbeb]", iconColor: "text-[#f59e0b]" },
						{ label: "낙찰 확정", value: `${data.awardedQuoteCount}건`, icon: CheckCircle2, tint: "bg-[#f0fdf4]", iconColor: "text-[#22c55e]" },
						{ label: "진행중 계약", value: `${data.contractCount}건`, icon: FileCheck, tint: "bg-[#f0fdf4]", iconColor: "text-[#22c55e]" },
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-xl border border-[#e2e8f0] bg-white p-5 transition-all hover:border-[#3B82F6]/30 hover:shadow-sm"
						>
							<div className="flex items-start justify-between">
								<span className={`flex size-10 items-center justify-center rounded-lg ${stat.tint}`}>
									<stat.icon size={20} className={stat.iconColor} />
								</span>
							</div>
							<p className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a]">{stat.value}</p>
							<p className="mt-1 text-sm font-medium text-[#64748b]">{stat.label}</p>
						</div>
					))}
				</div>

				{/* Two Column */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* 추천 공고 */}
					<div className="lg:col-span-2">
						<div className="rounded-xl border border-[#e2e8f0] bg-white">
							<div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
								<div className="flex items-center gap-2">
									<h2 className="text-base font-semibold text-[#0f172a]">추천 공고</h2>
									{recommendedListings.length > 0 && (
										<span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
											{recommendedListings.length}건
										</span>
									)}
								</div>
								<button
									onClick={() => handleNavigate("/seller/listing-browse")}
									className="text-sm font-medium text-[#3B82F6] hover:underline"
								>
									전체 공고 보기
								</button>
							</div>

							{recommendedListings.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#f1f5f9]">
										<Search size={22} className="text-[#94a3b8]" />
									</div>
									<p className="text-sm font-medium text-[#0f172a]">추천할 공고가 없어요</p>
									<p className="mt-1 text-xs text-[#64748b]">
										기업 프로필에서 취급 카테고리를 설정하면 맞춤 공고를 추천해드려요.
									</p>
									<button
										onClick={() => handleNavigate("/seller/profile/edit")}
										className="mt-4 rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc]"
									>
										프로필 편집하기
									</button>
								</div>
							) : (
								<ul className="divide-y divide-[#f1f5f9]">
									{recommendedListings.map((listing) => (
										<li key={listing.id}>
											<button
												onClick={() => handleNavigate(`/seller/listing-browse/${listing.id}`)}
												className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f8fafc]"
											>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<span className="shrink-0 rounded-md bg-[#eff6ff] px-2 py-0.5 text-[11px] font-medium text-[#3B82F6]">
															내 취급 카테고리
														</span>
														<h3 className="truncate text-sm font-semibold text-[#0f172a]">
															{listing.title}
														</h3>
													</div>
													<p className="mt-1 text-xs text-[#64748b]">
														{listing.deliveryProvinsi} {listing.deliveryCity} · 마감 {new Date(listing.endDate).toLocaleDateString("ko-KR")}
													</p>
												</div>
												<ArrowRight size={16} className="shrink-0 text-[#94a3b8]" />
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* Side Panel */}
					<div className="space-y-4">
						{/* 바로가기 */}
						<div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
							<h2 className="mb-3 px-1 text-sm font-semibold text-[#0f172a]">바로가기</h2>
							<div className="grid grid-cols-2 gap-3">
								{[
									{ label: "공고 탐색", sub: `${data.openListingCount}건`, icon: Search, tint: "bg-[#eff6ff]", color: "text-[#3B82F6]", href: "/seller/listing-browse" },
									{ label: "채팅", sub: "확인하기", icon: MessageSquare, tint: "bg-[#fffbeb]", color: "text-[#f59e0b]", href: "/seller/chat" },
								].map((link) => (
									<button
										key={link.label}
										onClick={() => handleNavigate(link.href)}
										className="group flex flex-col gap-3 rounded-lg border border-[#e2e8f0] p-3 text-left transition-all hover:border-[#3B82F6]/30 hover:shadow-sm"
									>
										<span className={`flex size-9 items-center justify-center rounded-lg ${link.tint}`}>
											<link.icon size={18} className={link.color} />
										</span>
										<span>
											<span className="flex items-center gap-1 text-sm font-semibold text-[#0f172a]">
												{link.label}
												<ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
											</span>
											<span className="mt-0.5 block text-xs text-[#64748b]">{link.sub}</span>
										</span>
									</button>
								))}
							</div>
						</div>

						{/* 기업 프로필 유도 */}
						<div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
							<div className="flex items-start gap-3">
								<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff]">
									<Building2 size={18} className="text-[#3B82F6]" />
								</span>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold text-[#0f172a]">기업 프로필 완성하기</p>
									<p className="mt-0.5 text-xs text-[#64748b]">
										바이어에게 신뢰를 주는 첫걸음이에요
									</p>
									<button
										onClick={() => handleNavigate("/seller/profile/edit")}
										className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#3B82F6] hover:underline"
									>
										프로필 편집하기
										<ArrowRight size={12} />
									</button>
								</div>
							</div>
						</div>

						{/* 최근 활동 */}
						<div className="rounded-xl border border-[#e2e8f0] bg-white">
							<div className="flex items-center gap-2 border-b border-[#e2e8f0] px-4 py-3">
								<Bell size={15} className="text-[#94a3b8]" />
								<h2 className="text-sm font-semibold text-[#0f172a]">최근 활동</h2>
							</div>
							<ul className="p-2">
								{data.activities.length === 0 ? (
									<li className="py-6 text-center text-sm text-[#94a3b8]">아직 활동이 없어요</li>
								) : (
									data.activities.map((activity, i) => (
										<li key={i} className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[#f8fafc]">
											<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9]">
												<Bell size={13} className="text-[#3B82F6]" />
											</span>
											<div className="min-w-0 flex-1">
												<p className="text-sm leading-snug text-[#0f172a]">{activity.title}</p>
												<p className="mt-0.5 text-xs text-[#94a3b8]">{activity.timeText}</p>
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