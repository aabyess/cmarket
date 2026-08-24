"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Mail, Clock, ChevronDown, ChevronUp, Bell, MessageSquare, Handshake } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { OnboardingChecklist } from "@/features/onboarding/components/OnboardingChecklist";
import { DashboardTodoRow } from "@/features/shared/components/DashboardTodoRow";
import { DashboardCustomizeBar } from "@/features/shared/components/DashboardCustomizeBar";
import { DashboardWidgetRemoveButton } from "@/features/shared/components/DashboardWidgetRemoveButton";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import type {
	BuyerActivity,
	BuyerDashboardData,
	BuyerTodo,
	BuyerTodoKind,
	BuyerTradeSummary,
} from "@/features/buyer/types";
import type { OnboardingChecklist as OnboardingChecklistData } from "@/features/onboarding/types";

type DashboardHomeProps = {
	companyName: string;
	data: BuyerDashboardData;
	tradeSummary: BuyerTradeSummary;
	onboardingChecklist: OnboardingChecklistData;
};

const KIND_LABEL_KEY: Record<BuyerTodoKind, string> = {
	quotePending: "kindQuotePending",
	paymentPending: "kindPaymentPending",
};

// 배너·온보딩 체크리스트·할 일 위젯은 핵심 액션 정보라 커스터마이징 대상에서 뺐다.
type BuyerWidgetKey = "tradeSummary" | "shortcuts" | "recentActivity";

export function DashboardHome({
	companyName,
	data,
	tradeSummary,
	onboardingChecklist,
}: DashboardHomeProps) {
	const t = useTranslations("BuyerDashboard");
	const tCustomize = useTranslations("DashboardCustomizeBar");
	const router = useRouter();
	const prefersReducedMotion = useReducedMotion();
	const [viewMode, setViewMode] = usePersistentState<ViewMode>(
		"mitrapay:buyer-dashboard-todo-view",
		"list",
	);
	// 새로고침하면 기본값(펼침)으로 돌아가야 해서 영속화하지 않는다.
	const [isExpanded, setIsExpanded] = useState(true);
	const { isEditing, toggleEditing, hiddenKeys, hideWidget, showWidget, isHidden, resetHidden } =
		useDashboardWidgets<BuyerWidgetKey>("mitrapay:buyer-dashboard-hidden-widgets");

	const widgetLabels: Record<BuyerWidgetKey, string> = {
		tradeSummary: t("tradeSummaryTitle"),
		shortcuts: t("shortcutsTitle"),
		recentActivity: t("recentActivityTitle"),
	};

	function handleNavigate(href: string) {
		router.push(href);
	}

	function handleTodoAction(todo: BuyerTodo) {
		if (todo.kind === "paymentPending") {
			router.push("/buyer/payments");
			return;
		}
		router.push(`/buyer/quote-review?listingId=${todo.listingId}`);
	}

	function handleActivityClick(activity: BuyerActivity) {
		if (activity.type === "quote") {
			router.push("/buyer/quote-review");
			return;
		}
		if (activity.type === "award") {
			router.push("/buyer/contract");
			return;
		}
		// quote_id가 없는 옛 알림은 특정 방으로 못 보내므로 채팅 목록으로 보낸다.
		if (!activity.quoteId) {
			router.push("/buyer/chat");
			return;
		}
		router.push(`/buyer/chat?quoteId=${activity.quoteId}`);
	}

	const urgentTodos = data.todos.filter((t) => t.highlights.length > 0);

	return (
		<div className="mx-auto max-w-[1200px] px-2 py-6 xl:px-0.5">
			{/* 배너 */}
			<div className="relative mb-6 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-[#EEF4FF] via-[#F5F9FF] to-white px-8 py-7">
				<div
					aria-hidden
					className="bg-imsg-blue/10 pointer-events-none absolute -top-10 -right-8 size-40 rounded-full blur-2xl"
				/>
				<div
					aria-hidden
					className="bg-imsg-blue/10 pointer-events-none absolute -right-4 bottom-[-2.5rem] size-28 rounded-full blur-xl"
				/>
				<div
					aria-hidden
					className="pointer-events-none absolute top-1/2 right-10 hidden size-16 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-white sm:flex">
					<Handshake size={28} className="text-imsg-blue" />
				</div>

				<div className="relative max-w-[75%] sm:max-w-[60%]">
					<p className="text-imsg-blue text-sm font-semibold">MitraPay</p>
					<h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0f172a]">
						{t("welcome", { companyName })}
					</h1>
					<p className="text-imsg-secondary mt-1.5 text-sm">{t("welcomeSubcopy")}</p>
				</div>
			</div>

			<DashboardCustomizeBar
				isEditing={isEditing}
				onToggleEditing={toggleEditing}
				hiddenWidgets={hiddenKeys.map((key) => ({ key, label: widgetLabels[key] }))}
				onShowWidget={(key) => showWidget(key as BuyerWidgetKey)}
				onResetHidden={resetHidden}
			/>

			<OnboardingChecklist checklist={onboardingChecklist} />

			{/* 나의 거래 요약 */}
			{!isHidden("tradeSummary") && (
				<div className="relative mb-6">
					{isEditing && (
						<DashboardWidgetRemoveButton
							label={tCustomize("removeWidgetAria", { widget: widgetLabels.tradeSummary })}
							onRemove={() => hideWidget("tradeSummary")}
						/>
					)}
					<div className="mb-3 flex items-center justify-between">
						<h2 className="text-base font-semibold text-[#0f172a]">{t("tradeSummaryTitle")}</h2>
					</div>
					<div className="rounded-2xl bg-white p-6 shadow-sm">
						<div className="grid grid-cols-1 divide-y divide-[#F2F2F7] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
							{[
								{ label: t("summaryInProgress"), ...tradeSummary.inProgress },
								{ label: t("summaryClosed"), ...tradeSummary.closed },
								{ label: t("summaryContracts"), ...tradeSummary.contracts },
							].map((block) => (
								<div
									key={block.label}
									className="px-0 py-4 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0">
									<div className="flex items-baseline justify-between">
										<p className="text-imsg-secondary text-sm font-medium">{block.label}</p>
										<p className="text-3xl font-bold text-[#0f172a]">
											{t("totalCount", { count: block.total })}
										</p>
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
			)}

			{/* Two Column */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Todo */}
				<div className="lg:col-span-2">
					<div className="rounded-2xl bg-white shadow-sm">
						<div className="flex items-center justify-between px-5 py-4">
							<div className="flex items-center gap-2">
								<h2 className="text-base font-semibold text-[#0f172a]">{t("todoTitle")}</h2>
								{data.todos.length > 0 && (
									<span className="text-imsg-secondary text-sm font-normal">
										{t("todoCount", { count: data.todos.length })}
									</span>
								)}
								{urgentTodos.length > 0 && (
									<span className="rounded-full bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-500">
										{t("urgentCount", { count: urgentTodos.length })}
									</span>
								)}
							</div>
							<div className="flex items-center gap-3">
								{data.todos.length > 0 && (
									<ViewModeToggle value={viewMode} onChange={setViewMode} />
								)}
								<button
									onClick={() => handleNavigate("/buyer/order-list")}
									className="text-imsg-blue text-sm font-medium hover:underline">
									{t("viewAll")}
								</button>
							</div>
						</div>

						<div className="h-px bg-[#F2F2F7]" />

						{data.todos.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<div className="bg-imsg-surface mb-3 flex size-12 items-center justify-center rounded-full">
									<Clock size={20} className="text-imsg-secondary" />
								</div>
								<p className="text-base font-medium text-[#0f172a]">{t("todoEmptyTitle")}</p>
								<p className="text-imsg-secondary mt-1 text-sm">
									{t("todoEmptyDescription", { count: data.listingCount })}
								</p>
								<button
									onClick={() => handleNavigate("/buyer/post-listing")}
									className="hover:bg-imsg-surface mt-4 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors">
									{t("todoEmptyAction")}
								</button>
							</div>
						) : (
							<>
								<AnimatePresence initial={false}>
									{isExpanded && (
										<motion.div
											key="todo-list"
											initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
											transition={
												prefersReducedMotion
													? { duration: 0 }
													: { type: "spring", stiffness: 400, damping: 34 }
											}
											className="overflow-hidden">
											<ul
												className={cn(
													viewMode === "list"
														? "divide-y divide-[#F2F2F7]"
														: "grid grid-cols-2 gap-2 p-3",
												)}>
												{data.todos.map((todo) => (
													<DashboardTodoRow
														key={todo.id}
														id={todo.id}
														variant={viewMode === "list" ? "row" : "card"}
														kind={todo.kind}
														kindLabel={t(KIND_LABEL_KEY[todo.kind])}
														title={todo.title}
														deadlineText={todo.deadlineText}
														isUrgent={todo.highlights.length > 0}
														urgentLabel={t("urgentBadge")}
														onClick={() => handleTodoAction(todo)}
													/>
												))}
											</ul>
										</motion.div>
									)}
								</AnimatePresence>
								<button
									type="button"
									onClick={() => setIsExpanded((prev) => !prev)}
									aria-label={isExpanded ? t("collapseListAria") : t("expandListAria")}
									className="text-imsg-secondary hover:bg-imsg-surface flex w-full items-center justify-center border-t border-[#F2F2F7] py-2 transition-colors hover:text-[#374151]">
									{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
								</button>
							</>
						)}
					</div>
				</div>

				{/* Side */}
				<div className="space-y-4">
					{/* 바로가기 */}
					{!isHidden("shortcuts") && (
						<div className="relative rounded-2xl bg-white p-4 shadow-sm">
							{isEditing && (
								<DashboardWidgetRemoveButton
									label={tCustomize("removeWidgetAria", { widget: widgetLabels.shortcuts })}
									onRemove={() => hideWidget("shortcuts")}
								/>
							)}
							<h2 className="text-imsg-secondary mb-3 text-sm font-semibold tracking-wider uppercase">
								{t("shortcutsTitle")}
							</h2>
							<div className="grid grid-cols-2 gap-2">
								{[
									{
										label: t("shortcutQuotesLabel"),
										sub: t("shortcutQuotesSub", { count: data.badges.quotes }),
										icon: Mail,
										iconBg: "bg-amber-50",
										color: "text-amber-500",
										href: "/buyer/quote-review",
									},
									{
										label: t("shortcutChatLabel"),
										sub: t("shortcutChatSub", { count: data.badges.chats }),
										icon: MessageSquare,
										iconBg: "bg-blue-50",
										color: "text-imsg-blue",
										href: "/buyer/chat",
									},
								].map((link) => (
									<button
										key={link.label}
										onClick={() => handleNavigate(link.href)}
										className="bg-imsg-surface flex flex-col gap-2.5 rounded-xl p-3 text-left transition-colors hover:bg-[#E5E7EB]">
										<span
											className={cn(
												"flex size-8 items-center justify-center rounded-lg",
												link.iconBg,
											)}>
											<link.icon size={16} className={link.color} />
										</span>
										<span>
											<span className="block text-sm font-semibold text-[#0f172a]">
												{link.label}
											</span>
											<span className="text-imsg-secondary block text-sm">{link.sub}</span>
										</span>
									</button>
								))}
							</div>
						</div>
					)}

					{/* 최근 활동 */}
					{!isHidden("recentActivity") && (
						<div className="relative rounded-2xl bg-white shadow-sm">
							{isEditing && (
								<DashboardWidgetRemoveButton
									label={tCustomize("removeWidgetAria", { widget: widgetLabels.recentActivity })}
									onRemove={() => hideWidget("recentActivity")}
								/>
							)}
							<div className="flex items-center gap-2 px-4 py-3">
								<h2 className="text-imsg-secondary text-sm font-semibold tracking-wider uppercase">
									{t("recentActivityTitle")}
								</h2>
							</div>
							<div className="h-px bg-[#F2F2F7]" />
							<ul className="p-2">
								{data.activities.length === 0 ? (
									<li className="text-imsg-secondary py-8 text-center text-sm">
										{t("recentActivityEmpty")}
									</li>
								) : (
									data.activities.map((activity, i) => (
										<li key={i}>
											<button
												onClick={() => handleActivityClick(activity)}
												className="hover:bg-imsg-surface flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors">
												<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
													<Bell size={12} className="text-imsg-blue" />
												</span>
												<div className="min-w-0 flex-1">
													<p className="text-sm text-[#0f172a]">{activity.title}</p>
													<p className="text-imsg-secondary mt-0.5 text-sm">{activity.timeText}</p>
												</div>
											</button>
										</li>
									))
								)}
							</ul>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
