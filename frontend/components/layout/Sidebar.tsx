"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
	LayoutDashboard, ListTodo, Mail, MessageSquare,
	FileCheck, HelpCircle, Search, Send, Building2,
	LogOut, User, FilePlus, Sparkles, Settings, FileText, Phone,
	Briefcase, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Shield, CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";
import { cn } from "@/utils/cn";
import { createClient } from "@/libs/supabase";

// TODO: 실제 지원센터 연락처 확인되면 교체
const SUPPORT_PHONE = "02-0000-0000";
const SUPPORT_EMAIL = "support@mitrapay.com";

type UserRole = "buyer" | "seller";

type SidebarProps = {
	role: UserRole;
	companyName: string;
	name: string;
	isCollapsed: boolean;
	onToggleCollapsed: () => void;
};

type MenuLeaf = {
	labelKey: string;
	key: string;
	icon: LucideIcon;
	href: string;
	badge: number | null;
};

// 하위 항목을 접었다 펼쳤다 하는 메뉴 그룹. children이 있으면 그룹, 없으면 일반 항목이다.
type MenuGroup = {
	labelKey: string;
	key: string;
	icon: LucideIcon;
	children: MenuLeaf[];
};

type MenuEntry = MenuLeaf | MenuGroup;

function isMenuGroup(entry: MenuEntry): entry is MenuGroup {
	return "children" in entry;
}

const BUYER_MENU_ITEMS: MenuEntry[] = [
	{ labelKey: "dashboard", key: "dashboard", icon: LayoutDashboard, href: "/buyer/dashboard", badge: null },
	{ labelKey: "postListing", key: "post-listing", icon: FilePlus, href: "/buyer/post-listing", badge: null },
	{
		labelKey: "tradeManagement",
		key: "trade-management",
		icon: Briefcase,
		children: [
			{ labelKey: "myListings", key: "listings", icon: ListTodo, href: "/buyer/order-list", badge: null },
			{ labelKey: "receivedQuotes", key: "quotes", icon: Mail, href: "/buyer/quote-review", badge: null },
			{ labelKey: "contract", key: "contract", icon: FileCheck, href: "/buyer/contract", badge: null },
			{ labelKey: "payments", key: "payments", icon: CreditCard, href: "/buyer/payments", badge: null },
			{ labelKey: "listingTemplates", key: "listing-templates", icon: FileText, href: "/buyer/listing-templates", badge: null },
		],
	},
	{ labelKey: "chat", key: "chat", icon: MessageSquare, href: "/buyer/chat", badge: null },
	{ labelKey: "profile", key: "profile", icon: Building2, href: "/buyer/profile/edit", badge: null },
	{ labelKey: "plans", key: "plans", icon: Sparkles, href: "/plans", badge: null },
	{ labelKey: "support", key: "support", icon: HelpCircle, href: "/support", badge: null },
];

const SELLER_MENU_ITEMS: MenuEntry[] = [
	{ labelKey: "dashboard", key: "dashboard", icon: LayoutDashboard, href: "/seller/dashboard", badge: null },
	{ labelKey: "browseListings", key: "browse", icon: Search, href: "/seller/listing-browse", badge: null },
	{
		labelKey: "tradeManagement",
		key: "trade-management",
		icon: Briefcase,
		children: [
			{ labelKey: "sentQuotes", key: "quotes", icon: Send, href: "/seller/quote-submit", badge: null },
			{ labelKey: "contract", key: "contract", icon: FileCheck, href: "/seller/contract", badge: null },
			{ labelKey: "payments", key: "payments", icon: CreditCard, href: "/seller/payments", badge: null },
		],
	},
	{ labelKey: "chat", key: "chat", icon: MessageSquare, href: "/seller/chat", badge: null },
	{ labelKey: "profile", key: "profile", icon: Building2, href: "/seller/profile/edit", badge: null },
	{ labelKey: "plans", key: "plans", icon: Sparkles, href: "/plans", badge: null },
	{ labelKey: "support", key: "support", icon: HelpCircle, href: "/support", badge: null },
];

export function Sidebar({ role, companyName, name, isCollapsed, onToggleCollapsed }: SidebarProps) {
	const t = useTranslations("Sidebar");
	const pathname = usePathname();
	const router = useRouter();
	const menuItems: MenuEntry[] = role === "seller" ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS;
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	// 기본은 펼침 상태라, 사용자가 접은 그룹의 key만 여기 담는다.
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

	const initial = name.charAt(0) || companyName.charAt(0) || "?";

	function toggleGroup(key: string): void {
		setCollapsedGroups((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			return next;
		});
	}

	// 레일(아이콘만) 상태에서 그룹을 클릭하면 플라이아웃 대신 사이드바를 펼치면서
	// 그 그룹도 함께 열어준다.
	function handleGroupClick(key: string): void {
		if (isCollapsed) {
			onToggleCollapsed();
			setCollapsedGroups((prev) => {
				const next = new Set(prev);
				next.delete(key);
				return next;
			});
			return;
		}
		toggleGroup(key);
	}

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	async function handleLogout() {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.push("/login");
	}

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 hidden h-screen flex-col overflow-visible border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex z-40",
				isCollapsed ? "w-20" : "w-64",
			)}
		>
			{/* 접기/펼치기 토글 — 우측 경계 세로 중앙의 길쭉한 핸들 (작은 원형은 눈에 안 띈다는 피드백) */}
			<button
				type="button"
				onClick={onToggleCollapsed}
				aria-label={isCollapsed ? t("expandAria") : t("collapseAria")}
				className="absolute top-1/2 -right-3.5 z-50 flex h-16 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-white text-sidebar-foreground/60 shadow-sm transition-colors hover:bg-imsg-surface hover:text-sidebar-foreground"
			>
				{isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
			</button>

			{/* 프로필 블록 */}
			<div className="px-3 pt-6 pb-4 border-b border-sidebar-border relative">
				<div className={cn("flex items-center gap-2 px-2", isCollapsed && "justify-center px-0")}>
					{/* 프로필 트리거 */}
					<div
						ref={dropdownRef}
						role="button"
						tabIndex={0}
						onClick={() => setDropdownOpen((prev) => !prev)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setDropdownOpen((prev) => !prev);
							}
						}}
						className={cn(
							"relative flex min-w-0 items-center gap-3 rounded-lg py-1 outline-none hover:bg-black/5 transition-colors cursor-pointer",
							isCollapsed ? "shrink-0" : "flex-1",
						)}
					>
						{/* 아바타 */}
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
							{initial}
						</div>
						{/* 이름 + 회사 */}
						{!isCollapsed && (
							<div className="min-w-0 flex-1 text-left">
								<p className="truncate text-sm font-semibold text-sidebar-foreground">{name || companyName}</p>
								<p className="truncate text-xs text-sidebar-foreground/60">{companyName}</p>
							</div>
						)}

						{/* 드롭다운 */}
						{dropdownOpen && (
							<div
								onClick={(e) => e.stopPropagation()}
								className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
							>
								<div className="px-4 py-3 border-b border-[#F3F4F6]">
									<p className="text-sm font-semibold text-[#1F2937]">{name || companyName}</p>
									<p className="text-xs text-[#9CA3AF]">{companyName}</p>
								</div>
								<div className="py-1">
									<Link
										href={`/${role}/profile/edit?tab=settings`}
										onClick={() => setDropdownOpen(false)}
										className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
									>
										<User size={14} />
										{t("dropdown.myProfile")}
									</Link>
									<Link
										href={`/${role}/settings`}
										onClick={() => setDropdownOpen(false)}
										className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
									>
										<Settings size={14} />
										{t("dropdown.settings")}
									</Link>
								</div>
								<div className="border-t border-[#F3F4F6] py-1">
									<Link
										href="/terms"
										onClick={() => setDropdownOpen(false)}
										className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
									>
										<FileText size={14} />
										{t("dropdown.terms")}
									</Link>
									<Link
										href="/privacy"
										onClick={() => setDropdownOpen(false)}
										className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] transition-colors"
									>
										<Shield size={14} />
										{t("dropdown.privacy")}
									</Link>
								</div>
								<div className="border-t border-[#F3F4F6] py-1">
									<button
										onClick={handleLogout}
										className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-[#FEF2F2] transition-colors"
									>
										<LogOut size={14} />
										{t("dropdown.logout")}
									</button>
								</div>
							</div>
						)}
					</div>

					{/* 알림/언어 - 프로필과 분리된 독립 영역. 레일 폭에서는 두 컴포넌트가 좁은
					    공간에서 어떻게 보일지 시각 확인이 어려워 접었을 땐 숨긴다. */}
					{!isCollapsed && (
						<>
							<LanguageSwitcher />
							<NotificationBell />
						</>
					)}
				</div>
			</div>

			{/* 메뉴 */}
			<nav className="flex-1 px-3 py-4 overflow-y-auto">
				{!isCollapsed && (
					<p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
						{t("menuHeading")}
					</p>
				)}
				<div className="space-y-0.5">
				{menuItems.map((entry) => {
					if (isMenuGroup(entry)) {
						const hasActiveChild = entry.children.some((child) => pathname.startsWith(child.href));
						// 활성 하위 경로에 있으면 접었더라도 강제로 펼친다.
						const isOpen = hasActiveChild || !collapsedGroups.has(entry.key);

						return (
							<div key={entry.key}>
								<button
									type="button"
									onClick={() => handleGroupClick(entry.key)}
									title={isCollapsed ? t(`menu.${entry.labelKey}`) : undefined}
									className={cn(
										"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
										isCollapsed && "justify-center px-0",
										// 하위 항목이 활성일 때 그룹 헤더까지 파랗게 칠하면 두 개가 선택된 것처럼
										// 보인다. 헤더는 배경 강조 없이 글자 굵기만 살짝 다르게 둔다.
										hasActiveChild
											? "text-[#111827] font-semibold hover:bg-white/70"
											: "text-[#374151] hover:bg-white/70 hover:text-[#1F2937]",
									)}
								>
									<entry.icon
										size={17}
										strokeWidth={2}
										className={cn("shrink-0", hasActiveChild ? "text-[#111827]" : "text-[#9CA3AF]")}
									/>
									{!isCollapsed && (
										<>
											<span className="flex-1 text-left">{t(`menu.${entry.labelKey}`)}</span>
											{isOpen ? (
												<ChevronUp size={15} className="shrink-0 text-[#9CA3AF]" />
											) : (
												<ChevronDown size={15} className="shrink-0 text-[#9CA3AF]" />
											)}
										</>
									)}
								</button>

								{isOpen && !isCollapsed && (
									<div className="mt-0.5 space-y-0.5">
										{entry.children.map((child) => {
											const isActive = pathname.startsWith(child.href);
											return (
												<Link
													key={child.key}
													href={child.href}
													className={cn(
														"flex items-center gap-3 rounded-lg py-2 pl-8 pr-3 text-xs font-medium transition-all",
														isActive
															? "bg-primary/10 text-[#111827] font-semibold"
															: "text-[#374151] hover:bg-white/70 hover:text-[#1F2937]",
													)}
												>
													<child.icon
														size={15}
														strokeWidth={2}
														className={cn("shrink-0", isActive ? "text-[#111827]" : "text-[#9CA3AF]")}
													/>
													<span className="flex-1">{t(`menu.${child.labelKey}`)}</span>
													{child.badge && (
														<span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold bg-white/20 text-white">
															{child.badge}
														</span>
													)}
												</Link>
											);
										})}
									</div>
								)}
							</div>
						);
					}

					const isActive = entry.href === "#" ? false : pathname.startsWith(entry.href);
					return (
						<Link
							key={entry.key}
							href={entry.href}
							title={isCollapsed ? t(`menu.${entry.labelKey}`) : undefined}
							className={cn(
								"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
								isCollapsed && "justify-center px-0",
								isActive
									? "bg-primary/10 text-[#111827] font-semibold"
									: "text-[#374151] hover:bg-white/70 hover:text-[#1F2937]",
							)}
						>
							<entry.icon
								size={17}
								strokeWidth={2}
								className={cn(
									"shrink-0",
									isActive ? "text-[#111827]" : "text-[#9CA3AF]",
								)}
							/>
							{!isCollapsed && (
								<>
									<span className="flex-1">{t(`menu.${entry.labelKey}`)}</span>
									{entry.badge && (
										<span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold bg-white/20 text-white">
											{entry.badge}
										</span>
									)}
								</>
							)}
						</Link>
					);
				})}
				</div>
			</nav>

			{/* 하단: 지원센터 연락처 — 레일 폭에는 들어갈 공간이 없어 접혔을 땐 숨긴다. */}
			{!isCollapsed && (
				<div className="mt-auto border-t border-sidebar-border px-4 py-4">
					<p className="text-xs font-semibold text-sidebar-foreground/60">{t("menu.support")}</p>
					<div className="mt-1.5 space-y-1">
						<div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/50">
							<Phone size={12} className="shrink-0" />
							<span>{SUPPORT_PHONE}</span>
						</div>
						<div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/50">
							<Mail size={12} className="shrink-0" />
							<span>{SUPPORT_EMAIL}</span>
						</div>
					</div>
				</div>
			)}
		</aside>
	);
}