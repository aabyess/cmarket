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
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SIDEBAR_TRANSITION_CLASS, getSidebarLayoutTransition } from "@/components/layout/sidebarTransition";
import {
	SIDEBAR_COLLAPSE_THRESHOLD,
	SIDEBAR_RAIL_WIDTH,
	clampSidebarWidth,
} from "@/components/layout/sidebarState";
import { getDropdownMotionProps } from "@/utils/dropdownMotion";

// TODO: 실제 지원센터 연락처 확인되면 교체
const SUPPORT_PHONE = "02-0000-0000";
const SUPPORT_EMAIL = "support@mitrapay.com";

type UserRole = "buyer" | "seller";

type SidebarProps = {
	role: UserRole;
	companyName: string;
	name: string;
	isCollapsed: boolean;
	/** 펼침 상태의 실제 렌더 폭(px). 접힘 상태에선 AppShell이 레일 고정폭을 내려준다. */
	width: number;
	isResizing: boolean;
	onToggleCollapsed: () => void;
	onResizeStart: () => void;
	/** 드래그 도중 실시간 미리보기 폭. */
	onResizePreview: (width: number) => void;
	onResizeEnd: (result: { collapsed: true } | { collapsed: false; width: number }) => void;
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

export function Sidebar({
	role,
	companyName,
	name,
	isCollapsed,
	width,
	isResizing,
	onToggleCollapsed,
	onResizeStart,
	onResizePreview,
	onResizeEnd,
}: SidebarProps) {
	const t = useTranslations("Sidebar");
	const pathname = usePathname();
	const router = useRouter();
	const menuItems: MenuEntry[] = role === "seller" ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS;
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	// 기본은 펼침 상태라, 사용자가 접은 그룹의 key만 여기 담는다.
	const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
	const prefersReducedMotion = useReducedMotion();
	const layoutTransition = getSidebarLayoutTransition(prefersReducedMotion);
	// 라벨 텍스트가 unmount로 뚝 사라지지 않고 살짝 크로스페이드되도록 opacity만 애니메이션한다
	// (너비 트랜지션은 aside 자체가 이미 하고 있어 라벨까지 너비를 따로 계산할 필요는 없다).
	const labelFade = {
		initial: prefersReducedMotion ? false : { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: layoutTransition,
	} as const;

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

	const dragStateRef = useRef<{ startX: number; startY: number; startWidth: number; moved: boolean } | null>(
		null,
	);
	// 드래그 종료 직후 브라우저가 이어서 발생시키는 click을 눌러야, 드래그를
	// 접기/펼치기 클릭으로 다시 처리하는 걸 막을 수 있다(setPointerCapture 쓸 때
	// 흔한 함정).
	const suppressNextClickRef = useRef(false);

	function handleHandlePointerDown(e: React.PointerEvent<HTMLButtonElement>): void {
		e.currentTarget.setPointerCapture(e.pointerId);
		dragStateRef.current = {
			startX: e.clientX,
			startY: e.clientY,
			// width prop은 접힘 상태에서도 이미 레일 고정폭으로 내려온다.
			startWidth: width,
			moved: false,
		};

		function handlePointerMove(moveEvent: PointerEvent): void {
			const drag = dragStateRef.current;
			if (!drag) return;
			const dx = moveEvent.clientX - drag.startX;

			if (!drag.moved) {
				if (Math.hypot(dx, moveEvent.clientY - drag.startY) < 4) return;
				drag.moved = true;
				onResizeStart();
				document.body.style.cursor = "col-resize";
				document.body.style.userSelect = "none";
			}

			const rawWidth = drag.startWidth + dx;
			onResizePreview(rawWidth <= SIDEBAR_COLLAPSE_THRESHOLD ? SIDEBAR_RAIL_WIDTH : clampSidebarWidth(rawWidth));
		}

		function handlePointerUp(upEvent: PointerEvent): void {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			const drag = dragStateRef.current;
			dragStateRef.current = null;
			// 이동량이 임계값 미만이면 드래그로 취급하지 않는다 — 곧 브라우저가 발생시킬
			// click 이벤트가 기존 접기/펼치기 토글을 그대로 처리한다.
			if (!drag || !drag.moved) return;

			document.body.style.cursor = "";
			document.body.style.userSelect = "";
			suppressNextClickRef.current = true;

			const dx = upEvent.clientX - drag.startX;
			const rawWidth = drag.startWidth + dx;
			if (rawWidth <= SIDEBAR_COLLAPSE_THRESHOLD) {
				onResizeEnd({ collapsed: true });
			} else {
				onResizeEnd({ collapsed: false, width: clampSidebarWidth(rawWidth) });
			}
		}

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
	}

	function handleHandleClick(): void {
		if (suppressNextClickRef.current) {
			suppressNextClickRef.current = false;
			return;
		}
		onToggleCollapsed();
	}

	return (
		<aside
			// width prop은 AppShell이 이미 접힘 상태(레일 고정폭)까지 반영해서 내려준다.
			style={{ width: `${width}px` }}
			className={cn(
				"fixed left-0 top-0 hidden h-screen flex-col overflow-visible border-r border-sidebar-border bg-sidebar lg:flex z-40",
				!isResizing && "transition-[width]",
				!isResizing && SIDEBAR_TRANSITION_CLASS,
			)}
		>
			{/* 접기/펼치기 토글 겸 리사이즈 핸들 — 우측 경계 세로 중앙의 길쭉한 핸들
			    (작은 원형은 눈에 안 띈다는 피드백). pointerdown 후 이동량이 거의 없으면
			    click으로 접기/펼치기, 그 이상 드래그하면 리사이즈로 처리한다. */}
			<button
				type="button"
				onPointerDown={handleHandlePointerDown}
				onClick={handleHandleClick}
				aria-label={isCollapsed ? t("expandAria") : t("collapseAria")}
				className="absolute top-1/2 -right-3.5 z-50 flex h-16 w-6 -translate-y-1/2 cursor-col-resize items-center justify-center rounded-full border border-sidebar-border bg-white text-sidebar-foreground/60 shadow-sm transition-colors hover:bg-imsg-surface hover:text-sidebar-foreground"
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
						<motion.div
							layout
							transition={layoutTransition}
							className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
							{initial}
						</motion.div>
						{/* 이름 + 회사 */}
						<AnimatePresence initial={false}>
							{!isCollapsed && (
								<motion.div key="profile-text" {...labelFade} className="min-w-0 flex-1 text-left">
									<p className="truncate text-sm font-semibold text-sidebar-foreground">{name || companyName}</p>
									<p className="truncate text-xs text-sidebar-foreground/60">{companyName}</p>
								</motion.div>
							)}
						</AnimatePresence>

						{/* 드롭다운 */}
						<AnimatePresence>
						{dropdownOpen && (
							<motion.div
								onClick={(e) => e.stopPropagation()}
								className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
								{...getDropdownMotionProps(prefersReducedMotion)}
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
							</motion.div>
						)}
						</AnimatePresence>
					</div>

					{/* 알림/언어 - 프로필과 분리된 독립 영역. 레일 폭에서는 두 컴포넌트가 좁은
					    공간에서 어떻게 보일지 시각 확인이 어려워 접었을 땐 숨긴다. */}
					<AnimatePresence initial={false}>
						{!isCollapsed && (
							<motion.div key="profile-actions" {...labelFade} className="flex items-center gap-2">
								{/* 사이드바는 화면 왼쪽 끝이라 드롭다운을 오른쪽으로 펼쳐야 안 잘린다. */}
								<LanguageSwitcher align="left" />
								<NotificationBell />
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			{/* 메뉴 */}
			<nav className="flex-1 px-3 py-4 overflow-y-auto">
				<AnimatePresence initial={false}>
					{!isCollapsed && (
						<motion.p
							key="menu-heading"
							{...labelFade}
							className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
							{t("menuHeading")}
						</motion.p>
					)}
				</AnimatePresence>
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
									<motion.span layout transition={layoutTransition} className="flex shrink-0 items-center justify-center">
										<entry.icon
											size={17}
											strokeWidth={2}
											className={hasActiveChild ? "text-[#111827]" : "text-[#9CA3AF]"}
										/>
									</motion.span>
									<AnimatePresence initial={false}>
										{!isCollapsed && (
											<motion.span
												key="group-label"
												{...labelFade}
												className="flex min-w-0 flex-1 items-center justify-between gap-2">
												<span className="truncate text-left">{t(`menu.${entry.labelKey}`)}</span>
												{isOpen ? (
													<ChevronUp size={15} className="shrink-0 text-[#9CA3AF]" />
												) : (
													<ChevronDown size={15} className="shrink-0 text-[#9CA3AF]" />
												)}
											</motion.span>
										)}
									</AnimatePresence>
								</button>

								<AnimatePresence initial={false}>
									{isOpen && !isCollapsed && (
										<motion.div
											key="group-children"
											initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
											transition={
												prefersReducedMotion
													? { duration: 0 }
													: { type: "spring", stiffness: 400, damping: 34 }
											}
											className="overflow-hidden">
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
													<span className="min-w-0 flex-1 truncate">{t(`menu.${child.labelKey}`)}</span>
													{child.badge && (
														<span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold bg-white/20 text-white">
															{child.badge}
														</span>
													)}
												</Link>
											);
										})}
										</div>
										</motion.div>
									)}
								</AnimatePresence>
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
							<motion.span layout transition={layoutTransition} className="flex shrink-0 items-center justify-center">
								<entry.icon
									size={17}
									strokeWidth={2}
									className={isActive ? "text-[#111827]" : "text-[#9CA3AF]"}
								/>
							</motion.span>
							<AnimatePresence initial={false}>
								{!isCollapsed && (
									<motion.span
										key="leaf-label"
										{...labelFade}
										className="flex min-w-0 flex-1 items-center justify-between gap-2">
										<span className="truncate">{t(`menu.${entry.labelKey}`)}</span>
										{entry.badge && (
											<span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold bg-white/20 text-white">
												{entry.badge}
											</span>
										)}
									</motion.span>
								)}
							</AnimatePresence>
						</Link>
					);
				})}
				</div>
			</nav>

			{/* 하단: 지원센터 연락처 — 레일 폭에는 들어갈 공간이 없어 접혔을 땐 숨긴다. */}
			<AnimatePresence initial={false}>
				{!isCollapsed && (
					<motion.div
						key="support-block"
						{...labelFade}
						className="mt-auto border-t border-sidebar-border px-4 py-4">
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
					</motion.div>
				)}
			</AnimatePresence>
		</aside>
	);
}