"use client";

import { useRouter } from "next/navigation";
import { Plus, FileText, Mail, FileCheck, TrendingUp, ArrowUpRight, Clock, ArrowRight, Bell, MessageSquare } from "lucide-react";
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
		<div className="min-h-screen bg-imsg-surface">
			<div className="mx-auto max-w-5xl px-6 py-10">

				{/* Welcome */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<p className="text-[13px] font-medium text-imsg-secondary">좋은 아침이에요 👋</p>
						<h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#0f172a]">
							{companyName}
						</h1>
					</div>
					<button
						onClick={() => handleNavigate("/buyer/post-listing")}
						className="flex items-center gap-1.5 rounded-full bg-imsg-blue px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-600 active:scale-95"
					>
						<Plus size={15} strokeWidth={2.5} />
						새 공고
					</button>
				</div>

				{/* Stat Cards */}
				<div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
					{[
						{
							label: "진행중 공고",
							value: `${data.listingCount}건`,
							icon: FileText,
							trend: "+2",
							trendLabel: "지난주 대비",
							iconBg: "bg-blue-50",
							iconColor: "text-imsg-blue",
						},
						{
							label: "받은 견적",
							value: `${data.badges.quotes}건`,
							icon: Mail,
							trend: "+8",
							trendLabel: "이번주 신규",
							iconBg: "bg-amber-50",
							iconColor: "text-amber-500",
						},
						{
							label: "진행중 계약",
							value: "2건",
							icon: FileCheck,
							trend: "0",
							trendLabel: "변동 없음",
							iconBg: "bg-emerald-50",
							iconColor: "text-emerald-500",
						},
						{
							label: "이번달 절감액",
							value: `$${data.savings.totalAmount.toLocaleString()}`,
							icon: TrendingUp,
							trend: "+18%",
							trendLabel: "지난달 대비",
							iconBg: "bg-emerald-50",
							iconColor: "text-emerald-500",
						},
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
						>
							<div className="flex items-start justify-between">
								<span className={cn("flex size-9 items-center justify-center rounded-xl", stat.iconBg)}>
									<stat.icon size={17} className={stat.iconColor} />
								</span>
								<span className="flex items-center gap-0.5 text-[11px] font-semibold text-emerald-500">
									<ArrowUpRight size={11} />
									{stat.trend}
								</span>
							</div>
							<p className="mt-4 text-[28px] font-bold tracking-tight text-[#0f172a]">
								{stat.value}
							</p>
							<p className="mt-0.5 text-[12px] text-imsg-secondary">
								{stat.label} · {stat.trendLabel}
							</p>
						</div>
					))}
				</div>

				{/* Two Column */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
					{/* Todo */}
					<div className="lg:col-span-2">
						<div className="rounded-2xl bg-white shadow-sm">
							<div className="flex items-center justify-between px-5 py-4">
								<div className="flex items-center gap-2">
									<h2 className="text-[15px] font-semibold text-[#0f172a]">할 일</h2>
									{urgentTodos.length > 0 && (
										<span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-500">
											{urgentTodos.length} 긴급
										</span>
									)}
								</div>
								<button
									onClick={() => handleNavigate("/buyer/order-list")}
									className="text-[13px] font-medium text-imsg-blue hover:underline"
								>
									모두 보기
								</button>
							</div>

							<div className="h-px bg-[#F2F2F7]" />

							{data.todos.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
										<Clock size={20} className="text-imsg-secondary" />
									</div>
									<p className="text-[14px] font-medium text-[#0f172a]">지금은 할 일이 없어요</p>
									<p className="mt-1 text-[12px] text-imsg-secondary">
										공고 {data.listingCount}건이 진행 중이에요. 견적이 도착하면 알려드릴게요.
									</p>
									<button
										onClick={() => handleNavigate("/buyer/order-list")}
										className="mt-4 rounded-full border border-[#E5E7EB] px-4 py-2 text-[13px] font-medium text-[#0f172a] transition-colors hover:bg-imsg-surface"
									>
										진행 중인 공고 보기
									</button>
								</div>
							) : (
								<ul>
									{data.todos.map((todo, i) => (
										<li
											key={todo.id}
											className={cn(
												"flex items-start gap-4 px-5 py-4 transition-colors hover:bg-imsg-surface",
												i !== data.todos.length - 1 && "border-b border-[#F2F2F7]",
												todo.highlights.length > 0 ? "border-l-2 border-l-red-400" : "border-l-2 border-l-imsg-blue",
											)}
										>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<h3 className="truncate text-[14px] font-semibold text-[#0f172a]">
														{todo.title}
													</h3>
													{todo.highlights.length > 0 && (
														<span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-500">
															긴급
														</span>
													)}
												</div>
												<p className="mt-0.5 text-[13px] text-imsg-secondary">{todo.description}</p>
												{todo.deadlineText && (
													<div className="mt-1.5 flex items-center gap-1 text-[11px] text-imsg-secondary">
														<Clock size={11} />
														<span className={todo.highlights.length > 0 ? "text-red-500" : ""}>
															{todo.deadlineText}
														</span>
													</div>
												)}
											</div>
											<button
												onClick={() => handleTodoAction(todo)}
												className={cn(
													"flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
													todo.highlights.length > 0
														? "bg-imsg-blue text-white hover:bg-blue-600"
														: "bg-imsg-surface text-[#0f172a] hover:bg-[#E5E7EB]",
												)}
											>
												{todo.actionLabel}
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
							<h2 className="mb-3 text-[13px] font-semibold text-imsg-secondary uppercase tracking-wider">
								바로가기
							</h2>
							<div className="grid grid-cols-2 gap-2">
								{[
									{
										label: "받은 견적",
										sub: `${data.badges.quotes}건`,
										icon: Mail,
										iconBg: "bg-amber-50",
										color: "text-amber-500",
										href: "/buyer/quote-review",
									},
									{
										label: "채팅",
										sub: `${data.badges.chats}건 읽지 않음`,
										icon: MessageSquare,
										iconBg: "bg-blue-50",
										color: "text-imsg-blue",
										href: "/buyer/chat",
									},
								].map((link) => (
									<button
										key={link.label}
										onClick={() => handleNavigate(link.href)}
										className="flex flex-col gap-2.5 rounded-xl bg-imsg-surface p-3 text-left transition-colors hover:bg-[#E5E7EB]"
									>
										<span className={cn("flex size-8 items-center justify-center rounded-lg", link.iconBg)}>
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

						{/* 최근 활동 */}
						<div className="rounded-2xl bg-white shadow-sm">
							<div className="flex items-center gap-2 px-4 py-3">
								<h2 className="text-[13px] font-semibold text-imsg-secondary uppercase tracking-wider">
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