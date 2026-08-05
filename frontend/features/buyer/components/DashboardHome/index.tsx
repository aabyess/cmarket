"use client";

import { useRouter } from "next/navigation";
import { Plus, FileText, Mail, FileCheck, TrendingUp, ArrowUpRight, Clock, ArrowRight, Bell, MessageSquare, CheckCircle2, DollarSign, ArrowUpRightIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import type { BuyerDashboardData, BuyerTodo } from "@/features/buyer/types";

type DashboardHomeProps = {
	companyName: string;
	data: BuyerDashboardData;
};

export function DashboardHome({ companyName, data }: DashboardHomeProps) {
	const router = useRouter();

	function handleNavigate(href: string) {
		router.push(href);
	}

	function handleTodoAction(todo: BuyerTodo) {
		router.push(`/buyer/quote-review?listingId=${todo.listingId}`);
	}

	const urgentTodos = data.todos.filter((t) => t.highlights.length > 0);

	return (
		<div className="min-h-screen bg-[#f8fafc]">
			<div className="mx-auto max-w-7xl px-6 py-8">

				{/* Welcome */}
				<div className="mb-6 flex items-end justify-between">
					<div>
						<p className="text-sm font-medium text-[#3B82F6]">좋은 아침이에요 👋</p>
						<h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0f172a]">
							{companyName}
						</h1>
					</div>
					<button
						onClick={() => handleNavigate("/buyer/post-listing")}
						className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2563EB]"
					>
						<Plus size={16} strokeWidth={2.5} />
						새 공고
					</button>
				</div>

				{/* Stat Cards */}
				<div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{[
						{ label: "진행중 공고", value: `${data.listingCount}건`, icon: FileText, trend: "+2", trendLabel: "지난주 대비", tint: "bg-[#eff6ff]", iconColor: "text-[#3B82F6]" },
						{ label: "받은 견적", value: `${data.badges.quotes}건`, icon: Mail, trend: "+8", trendLabel: "이번주 신규", tint: "bg-[#fffbeb]", iconColor: "text-[#f59e0b]" },
						{ label: "진행중 계약", value: "2건", icon: FileCheck, trend: "0", trendLabel: "변동 없음", tint: "bg-[#f0fdf4]", iconColor: "text-[#22c55e]" },
						{ label: "이번달 절감액", value: `$${data.savings.totalAmount.toLocaleString()}`, icon: TrendingUp, trend: "+18%", trendLabel: "지난달 대비", tint: "bg-[#f0fdf4]", iconColor: "text-[#22c55e]" },
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-xl border border-[#e2e8f0] bg-white p-5 transition-all hover:border-[#3B82F6]/30 hover:shadow-sm"
						>
							<div className="flex items-start justify-between">
								<span className={`flex size-10 items-center justify-center rounded-lg ${stat.tint}`}>
									<stat.icon size={20} className={stat.iconColor} />
								</span>
								<span className="flex items-center gap-0.5 rounded-full bg-[#f0fdf4] px-2 py-0.5 text-xs font-semibold text-[#22c55e]">
									<ArrowUpRight size={12} />
									{stat.trend}
								</span>
							</div>
							<p className="mt-4 text-3xl font-bold tracking-tight text-[#0f172a]">{stat.value}</p>
							<div className="mt-1 flex items-center gap-2">
								<p className="text-sm font-medium text-[#64748b]">{stat.label}</p>
								<span className="text-xs text-[#94a3b8]">· {stat.trendLabel}</span>
							</div>
						</div>
					))}
				</div>

				{/* Two Column */}
				<div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
					{/* Todo List */}
					<div className="lg:col-span-2">
						<div className="rounded-xl border border-[#e2e8f0] bg-white">
							<div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
								<div className="flex items-center gap-2">
									<h2 className="text-base font-semibold text-[#0f172a]">할 일</h2>
									{urgentTodos.length > 0 && (
										<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fee2e2] px-1.5 text-xs font-semibold text-[#ef4444]">
											{urgentTodos.length} 긴급
										</span>
									)}
								</div>
								<button
									onClick={() => handleNavigate("/buyer/order-list")}
									className="text-sm font-medium text-[#3B82F6] hover:underline"
								>
									모두 보기
								</button>
							</div>

							{data.todos.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-[#f1f5f9]">
										<Clock size={22} className="text-[#94a3b8]" />
									</div>
									<p className="text-sm font-medium text-[#0f172a]">지금은 할 일이 없어요</p>
									<p className="mt-1 text-xs text-[#64748b]">
										공고 {data.listingCount}건이 진행 중이에요. 견적이 도착하면 알려드릴게요.
									</p>
									<button
										onClick={() => handleNavigate("/buyer/order-list")}
										className="mt-4 rounded-lg border border-[#e2e8f0] px-4 py-2 text-sm font-medium text-[#0f172a] hover:bg-[#f8fafc]"
									>
										진행 중인 공고 보기
									</button>
								</div>
							) : (
								<ul className="divide-y divide-[#f1f5f9]">
									{data.todos.map((todo) => (
										<li
											key={todo.id}
											className={cn(
												"flex items-start gap-4 border-l-2 px-5 py-4 transition-colors hover:bg-[#f8fafc]",
												todo.highlights.length > 0 ? "border-l-[#ef4444]" : "border-l-[#3B82F6]",
											)}
										>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<h3 className="truncate text-sm font-semibold text-[#0f172a]">
														{todo.title}
													</h3>
													{todo.highlights.length > 0 && (
														<span className="shrink-0 rounded bg-[#fee2e2] px-1.5 py-0.5 text-[11px] font-semibold text-[#ef4444]">
															긴급
														</span>
													)}
												</div>
												<p className="mt-1 text-sm leading-relaxed text-[#64748b]">
													{todo.description}
												</p>
												{todo.deadlineText && (
													<div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#94a3b8]">
														<Clock size={13} />
														<span className={todo.highlights.length > 0 ? "text-[#ef4444]" : ""}>
															{todo.deadlineText}
														</span>
													</div>
												)}
											</div>
											<button
												onClick={() => handleTodoAction(todo)}
												className={cn(
													"flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
													todo.highlights.length > 0
														? "bg-[#3B82F6] text-white hover:bg-[#2563EB]"
														: "border border-[#e2e8f0] text-[#0f172a] hover:bg-[#f1f5f9]",
												)}
											>
												{todo.actionLabel}
												<ArrowRight size={13} />
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
									{ label: "받은 견적", sub: `${data.badges.quotes}건`, icon: Mail, tint: "bg-[#fffbeb]", color: "text-[#f59e0b]", href: "/buyer/quote-review" },
									{ label: "채팅", sub: `${data.badges.chats}건 읽지 않음`, icon: MessageSquare, tint: "bg-[#eff6ff]", color: "text-[#3B82F6]", href: "/buyer/chat" },
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

				{/* 마감 임박 공고 — 실데이터 연결 전 임시 비노출 */}
			</div>
		</div>
	);
}