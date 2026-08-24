"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ArrowRight, Bell, Building2, Clock, MessageSquare, Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { SellerDashboardTodo } from "@/features/seller/components/DashboardHome/SellerDashboardTodo";
import { OnboardingChecklist } from "@/features/onboarding/components/OnboardingChecklist";
import { DashboardCustomizeBar } from "@/features/shared/components/DashboardCustomizeBar";
import { DashboardWidgetRemoveButton } from "@/features/shared/components/DashboardWidgetRemoveButton";
import type { OpenListing, SellerDashboardData, SellerTodo } from "@/features/seller/types";
import type { OnboardingChecklist as OnboardingChecklistData } from "@/features/onboarding/types";

type DashboardHomeProps = {
	companyName: string;
	data: SellerDashboardData;
	recommendedListings: OpenListing[];
	todos: SellerTodo[];
	onboardingChecklist: OnboardingChecklistData;
};

// 배너·온보딩 체크리스트는 핵심 액션 정보라 커스터마이징 대상에서 뺐다.
type SellerWidgetKey =
	"todo" | "tradeSummary" | "recommendedListings" | "shortcuts" | "companyPage" | "recentActivity";

export function DashboardHome({
	companyName,
	data,
	recommendedListings,
	todos,
	onboardingChecklist,
}: DashboardHomeProps): React.JSX.Element {
	const t = useTranslations("SellerDashboard");
	const tCustomize = useTranslations("DashboardCustomizeBar");
	const locale = useLocale();
	const router = useRouter();
	const { isEditing, toggleEditing, hiddenKeys, hideWidget, showWidget, isHidden, resetHidden } =
		useDashboardWidgets<SellerWidgetKey>("mitrapay:seller-dashboard-hidden-widgets");

	const widgetLabels: Record<SellerWidgetKey, string> = {
		todo: t("todoTitle"),
		tradeSummary: t("tradeSummaryTitle"),
		recommendedListings: t("recommendedTitle"),
		shortcuts: t("shortcutsTitle"),
		companyPage: t("companyPageTitle"),
		recentActivity: t("recentActivityTitle"),
	};

	function handleNavigate(href: string): void {
		router.push(href);
	}

	const summaryBlocks = [
		{
			label: t("summaryListingsLabel"),
			total: data.openListingCount,
			subItems: [
				{
					label: t("summaryListingsSubLabel"),
					value: t("totalCount", { count: recommendedListings.length }),
				},
			],
		},
		{
			label: t("summaryQuotesLabel"),
			total: data.quoteCount,
			subItems: [
				{
					label: t("summaryQuotesPendingLabel"),
					value: t("totalCount", { count: data.pendingQuoteCount }),
				},
				{
					label: t("summaryQuotesAwardedLabel"),
					value: t("totalCount", { count: data.awardedQuoteCount }),
				},
			],
		},
		{
			label: t("summaryContractsLabel"),
			total: data.contractCount,
			subItems: [
				{
					label: t("summaryContractsAwardedLabel"),
					value: t("totalCount", { count: data.awardedQuoteCount }),
				},
			],
		},
	];

	const quickLinks = [
		{
			label: t("shortcutBrowseLabel"),
			sub: t("shortcutBrowseSub", { count: data.openListingCount }),
			icon: Search,
			iconBg: "bg-blue-50",
			color: "text-imsg-blue",
			href: "/seller/listing-browse",
		},
		{
			label: t("shortcutChatLabel"),
			sub: t("shortcutChatSub"),
			icon: MessageSquare,
			iconBg: "bg-amber-50",
			color: "text-amber-500",
			href: "/seller/chat",
		},
	];

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
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
					<Search size={28} className="text-imsg-blue" />
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
				onShowWidget={(key) => showWidget(key as SellerWidgetKey)}
				onResetHidden={resetHidden}
			/>

			<OnboardingChecklist checklist={onboardingChecklist} />

			{/* 할 일 */}
			{!isHidden("todo") && (
				<SellerDashboardTodo
					todos={todos}
					isEditing={isEditing}
					onRemove={() => hideWidget("todo")}
					removeAriaLabel={tCustomize("removeWidgetAria", { widget: widgetLabels.todo })}
				/>
			)}

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
							{summaryBlocks.map((block) => (
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
				{/* 추천 견적 */}
				{!isHidden("recommendedListings") && (
					<div className="relative lg:col-span-2">
						{isEditing && (
							<DashboardWidgetRemoveButton
								label={tCustomize("removeWidgetAria", { widget: widgetLabels.recommendedListings })}
								onRemove={() => hideWidget("recommendedListings")}
							/>
						)}
						<div className="rounded-2xl bg-white shadow-sm">
							<div className="flex items-center justify-between px-5 py-4">
								<div className="flex items-center gap-2">
									<h2 className="text-base font-semibold text-[#0f172a]">
										{t("recommendedTitle")}
									</h2>
									{recommendedListings.length > 0 && (
										<span className="text-imsg-blue rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold">
											{t("totalCount", { count: recommendedListings.length })}
										</span>
									)}
								</div>
								<button
									onClick={() => handleNavigate("/seller/listing-browse")}
									className="text-imsg-blue text-sm font-medium hover:underline">
									{t("viewAll")}
								</button>
							</div>

							<div className="h-px bg-[#F2F2F7]" />

							{recommendedListings.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<div className="bg-imsg-surface mb-3 flex size-12 items-center justify-center rounded-full">
										<Search size={20} className="text-imsg-secondary" />
									</div>
									<p className="text-base font-medium text-[#0f172a]">
										{t("recommendedEmptyTitle")}
									</p>
									<p className="text-imsg-secondary mt-1 text-sm">
										{t("recommendedEmptyDescription")}
									</p>
									<button
										onClick={() => handleNavigate("/seller/profile/edit?tab=settings")}
										className="hover:bg-imsg-surface mt-4 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium text-[#0f172a] transition-colors duration-200">
										{t("recommendedEmptyAction")}
									</button>
								</div>
							) : (
								<ul className="p-2">
									{recommendedListings.map((listing, i) => (
										<li key={listing.id}>
											<div className="hover:bg-imsg-surface relative flex items-start gap-4 rounded-xl py-3.5 pr-3 pl-5 transition-colors duration-200">
												<span className="bg-imsg-blue absolute top-1/2 left-1.5 h-6 w-[3px] -translate-y-1/2 rounded-full" />

												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<h3 className="truncate text-base font-semibold text-[#0f172a]">
															{listing.title}
														</h3>
														<span className="text-imsg-blue shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold">
															{t("myCategoryBadge")}
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
													onClick={() => handleNavigate(`/seller/listing-browse/${listing.id}`)}
													className="bg-imsg-surface flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold text-[#0f172a] transition-colors duration-200 hover:bg-[#E5E7EB]">
													{t("sendQuoteAction")}
													<ArrowRight size={12} />
												</button>
											</div>

											{i !== recommendedListings.length - 1 && (
												<div className="mx-5 h-px bg-[#F2F2F7]" />
											)}
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}

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
								{quickLinks.map((link) => (
									<button
										key={link.label}
										onClick={() => handleNavigate(link.href)}
										className="bg-imsg-surface flex flex-col gap-2.5 rounded-xl p-3 text-left transition-colors duration-200 hover:bg-[#E5E7EB]">
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

					{/* 기업 홈페이지 유도 */}
					{!isHidden("companyPage") && (
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
									<p className="text-sm font-semibold text-[#0f172a]">{t("companyPageTitle")}</p>
									<p className="text-imsg-secondary mt-0.5 text-sm">
										{t("companyPageDescription")}
									</p>
									<button
										onClick={() => handleNavigate("/seller/profile/edit")}
										className="text-imsg-blue mt-2 flex items-center gap-1 text-sm font-semibold hover:underline">
										{t("companyPageAction")}
										<ArrowRight size={11} />
									</button>
								</div>
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
										<li
											key={i}
											className="hover:bg-imsg-surface flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors duration-200">
											<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50">
												<Bell size={12} className="text-imsg-blue" />
											</span>
											<div className="min-w-0 flex-1">
												<p className="text-sm text-[#0f172a]">{activity.title}</p>
												<p className="text-imsg-secondary mt-0.5 text-sm">{activity.timeText}</p>
											</div>
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
