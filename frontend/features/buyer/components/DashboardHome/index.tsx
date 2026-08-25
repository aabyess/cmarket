"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion, Reorder, useReducedMotion } from "motion/react";
import {
	Mail,
	Clock,
	ChevronDown,
	ChevronUp,
	Bell,
	MessageSquare,
	Handshake,
	ArrowRight,
	Building2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { useDismissedTodos } from "@/hooks/useDismissedTodos";
import { OnboardingChecklist } from "@/features/onboarding/components/OnboardingChecklist";
import { DashboardTodoRow } from "@/features/shared/components/DashboardTodoRow";
import { DashboardTodoAgenda } from "@/features/shared/components/DashboardTodoAgenda";
import {
	DashboardTodoViewToggle,
	type DashboardTodoViewMode,
} from "@/features/shared/components/DashboardTodoViewToggle";
import { DashboardCustomizeBar } from "@/features/shared/components/DashboardCustomizeBar";
import { DashboardWidgetRemoveButton } from "@/features/shared/components/DashboardWidgetRemoveButton";
import { DashboardReorderableWidget } from "@/features/shared/components/DashboardReorderableWidget";
import { DashboardWidgetPop } from "@/features/shared/components/DashboardWidgetPop";
import type {
	BuyerActivity,
	BuyerDashboardData,
	BuyerTodo,
	BuyerTradeSummary,
} from "@/features/buyer/types";
import type { OnboardingChecklist as OnboardingChecklistData } from "@/features/onboarding/types";

type DashboardHomeProps = {
	companyName: string;
	data: BuyerDashboardData;
	tradeSummary: BuyerTradeSummary;
	onboardingChecklist: OnboardingChecklistData;
};

type BuyerWidgetKey =
	| "banner"
	| "onboardingChecklist"
	| "todo"
	| "tradeSummary"
	| "receivedInterest"
	| "shortcuts"
	| "recentActivity"
	| "companyPage";
// 사이드 컬럼 위젯만 같은 영역 안에서 드래그로 순서를 바꿀 수 있다(메인 영역인
// banner/onboardingChecklist/todo/tradeSummary/receivedInterest는 순서 변경 대상이 아니다).
type BuyerSideWidgetKey = "shortcuts" | "recentActivity" | "companyPage";
const BUYER_SIDE_WIDGET_ORDER: BuyerSideWidgetKey[] = [
	"shortcuts",
	"recentActivity",
	"companyPage",
];

// 관심 받은 견적은 아직 실제 로직 없이 더미 데이터만 노출한다(북마크 연동은 별도 작업 예정).
type MockReceivedInterestListing = {
	id: string;
	title: string;
	deliveryProvinsi: string;
	deliveryCity: string;
	endDate: string;
	interestCount: number;
};

const MOCK_RECEIVED_INTEREST_LISTINGS: MockReceivedInterestListing[] = [
	{
		id: "mock-interest-1",
		title: "사무용 프린터 20대 구매",
		deliveryProvinsi: "DKI Jakarta",
		deliveryCity: "Jakarta Selatan",
		endDate: "2026-09-12",
		interestCount: 5,
	},
	{
		id: "mock-interest-2",
		title: "실험실용 안전 캐비닛 8개",
		deliveryProvinsi: "Jawa Barat",
		deliveryCity: "Bandung",
		endDate: "2026-09-18",
		interestCount: 3,
	},
	{
		id: "mock-interest-3",
		title: "산업용 컨베이어 벨트 부품",
		deliveryProvinsi: "Banten",
		deliveryCity: "Tangerang",
		endDate: "2026-09-22",
		interestCount: 2,
	},
];

export function DashboardHome({
	companyName,
	data,
	tradeSummary,
	onboardingChecklist,
}: DashboardHomeProps) {
	const t = useTranslations("BuyerDashboard");
	const tCustomize = useTranslations("DashboardCustomizeBar");
	const tOnboarding = useTranslations("OnboardingChecklist");
	const locale = useLocale();
	const router = useRouter();
	const prefersReducedMotion = useReducedMotion();
	const [viewMode, setViewMode] = usePersistentState<DashboardTodoViewMode>(
		"mitrapay:buyer-dashboard-todo-view",
		"list",
	);
	// 새로고침하면 기본값(펼침)으로 돌아가야 해서 영속화하지 않는다.
	const [isExpanded, setIsExpanded] = useState(true);
	const {
		isEditing,
		toggleEditing,
		hiddenKeys,
		hideWidget,
		showWidget,
		isHidden,
		resetHidden,
		order: sideOrder,
		reorder: reorderSide,
	} = useDashboardWidgets<BuyerWidgetKey, BuyerSideWidgetKey>(
		"mitrapay:buyer-dashboard-hidden-widgets",
		BUYER_SIDE_WIDGET_ORDER,
	);
	const { isDismissed: isTodoDismissed, dismiss: dismissTodo } = useDismissedTodos(
		"mitrapay:buyer-dashboard-dismissed-todos",
	);

	const widgetLabels: Record<BuyerWidgetKey, string> = {
		banner: tCustomize("bannerLabel"),
		onboardingChecklist: tOnboarding("title"),
		todo: t("todoTitle"),
		tradeSummary: t("tradeSummaryTitle"),
		receivedInterest: t("receivedInterestTitle"),
		shortcuts: t("shortcutsTitle"),
		recentActivity: t("recentActivityTitle"),
		companyPage: t("companyPageTitle"),
	};

	const visibleSideOrder = sideOrder.filter((key) => !isHidden(key));

	function handleReorderSide(newVisibleOrder: BuyerSideWidgetKey[]): void {
		let i = 0;
		reorderSide(sideOrder.map((key) => (isHidden(key) ? key : newVisibleOrder[i++])));
	}

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

	const visibleTodos = data.todos.filter((todo) => !isTodoDismissed(todo.id));
	const urgentTodos = visibleTodos.filter((t) => t.highlights.length > 0);

	return (
		<div className="mx-auto max-w-[1200px] px-2 py-6 xl:px-0.5">
			{/* 배너 */}
			<DashboardWidgetPop show={!isHidden("banner")}>
				<div className="border-hairline relative mb-6 overflow-hidden rounded-2xl border bg-gradient-to-r from-[#EEF4FF] via-[#F5F9FF] to-white px-8 py-7">
					{isEditing && (
						<DashboardWidgetRemoveButton
							label={tCustomize("removeWidgetAria", { widget: widgetLabels.banner })}
							onRemove={() => hideWidget("banner")}
						/>
					)}
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
			</DashboardWidgetPop>

			<DashboardCustomizeBar
				isEditing={isEditing}
				onToggleEditing={toggleEditing}
				hiddenWidgets={hiddenKeys.map((key) => ({ key, label: widgetLabels[key] }))}
				onShowWidget={(key) => showWidget(key as BuyerWidgetKey)}
				onResetHidden={resetHidden}
			/>

			<DashboardWidgetPop show={!isHidden("onboardingChecklist")}>
				<div className="relative">
					{isEditing && (
						<DashboardWidgetRemoveButton
							label={tCustomize("removeWidgetAria", { widget: widgetLabels.onboardingChecklist })}
							onRemove={() => hideWidget("onboardingChecklist")}
						/>
					)}
					<OnboardingChecklist checklist={onboardingChecklist} />
				</div>
			</DashboardWidgetPop>

			{/* 나의 거래 요약 */}
			<DashboardWidgetPop show={!isHidden("tradeSummary")}>
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
			</DashboardWidgetPop>

			{/* Two Column */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="flex flex-col gap-4 lg:col-span-2">
					{/* Todo */}
					<DashboardWidgetPop show={!isHidden("todo")}>
						<div className="relative">
							{isEditing && (
								<DashboardWidgetRemoveButton
									label={tCustomize("removeWidgetAria", { widget: widgetLabels.todo })}
									onRemove={() => hideWidget("todo")}
								/>
							)}
							<div className="rounded-2xl bg-white shadow-sm">
								<div className="flex items-center justify-between px-5 py-4">
									<div className="flex items-center gap-2">
										<h2 className="text-base font-semibold text-[#0f172a]">{t("todoTitle")}</h2>
										{visibleTodos.length > 0 && (
											<span className="text-imsg-secondary text-sm font-normal">
												{t("todoCount", { count: visibleTodos.length })}
											</span>
										)}
										{urgentTodos.length > 0 && (
											<span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-sm font-semibold text-[#DC2626]">
												{t("urgentCount", { count: urgentTodos.length })}
											</span>
										)}
									</div>
									<div className="flex items-center gap-3">
										{visibleTodos.length > 0 && (
											<DashboardTodoViewToggle value={viewMode} onChange={setViewMode} />
										)}
										<button
											onClick={() => handleNavigate("/buyer/order-list")}
											className="text-imsg-blue text-sm font-medium hover:underline">
											{t("viewAll")}
										</button>
									</div>
								</div>

								<div className="h-px bg-[#F2F2F7]" />

								{visibleTodos.length === 0 ? (
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
											className="hover:bg-imsg-surface border-hairline mt-4 rounded-full border px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors">
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
													{viewMode === "agenda" ? (
														<DashboardTodoAgenda
															items={visibleTodos.map((todo) => ({
																id: todo.id,
																title: todo.title,
																deadlineText: todo.deadlineText,
																dueTime: todo.dueTime,
																isUrgent: todo.highlights.length > 0,
																onClick: () => handleTodoAction(todo),
															}))}
															urgentLabel={t("urgentBadge")}
															onDismissItem={dismissTodo}
														/>
													) : (
														<ul className="divide-y divide-[#F2F2F7]">
															{visibleTodos.map((todo) => (
																<DashboardTodoRow
																	key={todo.id}
																	id={todo.id}
																	title={todo.title}
																	deadlineText={todo.deadlineText}
																	isUrgent={todo.highlights.length > 0}
																	urgentLabel={t("urgentBadge")}
																	onClick={() => handleTodoAction(todo)}
																/>
															))}
														</ul>
													)}
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
					</DashboardWidgetPop>

					{/* 관심 받은 견적 — 더미 데이터, 실제 북마크 연동은 별도 작업 예정 */}
					<DashboardWidgetPop show={!isHidden("receivedInterest")}>
						<div className="relative">
							{isEditing && (
								<DashboardWidgetRemoveButton
									label={tCustomize("removeWidgetAria", { widget: widgetLabels.receivedInterest })}
									onRemove={() => hideWidget("receivedInterest")}
								/>
							)}
							<div className="rounded-2xl bg-white shadow-sm">
								<div className="flex items-center justify-between px-5 py-4">
									<div className="flex items-center gap-2">
										<h2 className="text-base font-semibold text-[#0f172a]">
											{t("receivedInterestTitle")}
										</h2>
										<span className="text-imsg-blue rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold">
											{t("totalCount", { count: MOCK_RECEIVED_INTEREST_LISTINGS.length })}
										</span>
									</div>
									<button
										onClick={() => console.log("TODO: 관심 받은 견적 모두 보기")}
										className="text-imsg-blue text-sm font-medium hover:underline">
										{t("viewAll")}
									</button>
								</div>

								<div className="h-px bg-[#F2F2F7]" />

								<ul className="p-2">
									{MOCK_RECEIVED_INTEREST_LISTINGS.map((listing, i) => (
										<li key={listing.id}>
											<div className="hover:bg-imsg-surface relative flex items-start gap-4 rounded-xl py-3.5 pr-3 pl-5 transition-colors duration-200">
												<span className="bg-imsg-blue absolute top-1/2 left-1.5 h-6 w-[3px] -translate-y-1/2 rounded-full" />

												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<h3 className="truncate text-base font-semibold text-[#0f172a]">
															{listing.title}
														</h3>
														<span className="text-imsg-blue shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold">
															{t("interestCountBadge", { count: listing.interestCount })}
														</span>
													</div>
													<p className="text-imsg-secondary mt-0.5 text-sm">
														{[listing.deliveryProvinsi, listing.deliveryCity]
															.filter(Boolean)
															.join(" ")}
													</p>
													<div className="text-imsg-secondary mt-1.5 flex items-center gap-1 text-sm">
														<Clock size={11} />
														<span>
															{t("deadlinePrefix")}{" "}
															{new Date(listing.endDate).toLocaleDateString(locale)}
														</span>
													</div>
												</div>

												<button
													onClick={() => console.log("TODO: 공고 상세로 이동", listing.id)}
													className="bg-imsg-surface flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold text-[#0f172a] transition-colors duration-200 hover:bg-[#E5E7EB]">
													{t("checkQuotesAction")}
													<ArrowRight size={12} />
												</button>
											</div>

											{i !== MOCK_RECEIVED_INTEREST_LISTINGS.length - 1 && (
												<div className="mx-5 h-px bg-[#F2F2F7]" />
											)}
										</li>
									))}
								</ul>
							</div>
						</div>
					</DashboardWidgetPop>
				</div>

				{/* Side */}
				<Reorder.Group
					as="div"
					axis="y"
					values={visibleSideOrder}
					onReorder={handleReorderSide}
					className="space-y-4">
					<AnimatePresence initial={false}>
						{visibleSideOrder.map((key) => (
							<DashboardReorderableWidget
								key={key}
								value={key}
								isEditing={isEditing}
								dragHandleLabel={tCustomize("dragWidgetAria", { widget: widgetLabels[key] })}>
								{key === "shortcuts" ? (
									<div className="relative rounded-2xl bg-white p-4 shadow-sm">
										{isEditing && (
											<DashboardWidgetRemoveButton
												label={tCustomize("removeWidgetAria", { widget: widgetLabels.shortcuts })}
												onRemove={() => hideWidget("shortcuts")}
											/>
										)}
										<h2 className="mb-3 text-sm font-semibold tracking-wider text-[#0f172a] uppercase">
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
													className="bg-imsg-surface hover:bg-hairline flex flex-col gap-2.5 rounded-xl p-3 text-left transition-colors">
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
								) : key === "recentActivity" ? (
									<div className="relative rounded-2xl bg-white shadow-sm">
										{isEditing && (
											<DashboardWidgetRemoveButton
												label={tCustomize("removeWidgetAria", {
													widget: widgetLabels.recentActivity,
												})}
												onRemove={() => hideWidget("recentActivity")}
											/>
										)}
										<div className="flex items-center gap-2 px-4 py-3">
											<h2 className="text-sm font-semibold tracking-wider text-[#0f172a] uppercase">
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
																<p className="text-imsg-secondary mt-0.5 text-sm">
																	{activity.timeText}
																</p>
															</div>
														</button>
													</li>
												))
											)}
										</ul>
									</div>
								) : (
									<div className="relative rounded-2xl bg-white p-4 shadow-sm">
										{isEditing && (
											<DashboardWidgetRemoveButton
												label={tCustomize("removeWidgetAria", { widget: widgetLabels.companyPage })}
												onRemove={() => hideWidget("companyPage")}
											/>
										)}
										<div className="flex items-start gap-3">
											<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
												<Building2 size={16} className="text-imsg-blue" />
											</span>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-semibold text-[#0f172a]">
													{t("companyPageTitle")}
												</p>
												<p className="text-imsg-secondary mt-0.5 text-sm">
													{t("companyPageDescription")}
												</p>
												<button
													onClick={() => handleNavigate("/buyer/profile/edit")}
													className="text-imsg-blue mt-2 flex items-center gap-1 text-sm font-semibold hover:underline">
													{t("companyPageAction")}
													<ArrowRight size={11} />
												</button>
											</div>
										</div>
									</div>
								)}
							</DashboardReorderableWidget>
						))}
					</AnimatePresence>
				</Reorder.Group>
			</div>
		</div>
	);
}
