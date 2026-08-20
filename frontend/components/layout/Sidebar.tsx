"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
	LayoutDashboard, ListTodo, Mail, MessageSquare,
	FileCheck, HelpCircle, Search, Send, Building2,
	LogOut, User, FilePlus, Sparkles, Settings, FileText,
} from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";
import { cn } from "@/utils/cn";
import { createClient } from "@/libs/supabase";

type UserRole = "buyer" | "seller";

type SidebarProps = {
	role: UserRole;
	companyName: string;
	name: string;
};

const BUYER_MENU_ITEMS = [
	{ labelKey: "dashboard", key: "dashboard", icon: LayoutDashboard, href: "/buyer/dashboard", badge: null },
	{ labelKey: "postListing", key: "post-listing", icon: FilePlus, href: "/buyer/post-listing", badge: null },
	{ labelKey: "myListings", key: "listings", icon: ListTodo, href: "/buyer/order-list", badge: null },
	{ labelKey: "receivedQuotes", key: "quotes", icon: Mail, href: "/buyer/quote-review", badge: null },
	{ labelKey: "chat", key: "chat", icon: MessageSquare, href: "/buyer/chat", badge: null },
	{ labelKey: "contract", key: "contract", icon: FileCheck, href: "/buyer/contract", badge: null },
	{ labelKey: "profile", key: "profile", icon: Building2, href: "/buyer/profile/edit", badge: null },
	{ labelKey: "plans", key: "plans", icon: Sparkles, href: "/plans", badge: null },
	{ labelKey: "support", key: "support", icon: HelpCircle, href: "/support", badge: null },
];

const SELLER_MENU_ITEMS = [
	{ labelKey: "dashboard", key: "dashboard", icon: LayoutDashboard, href: "/seller/dashboard", badge: null },
	{ labelKey: "browseListings", key: "browse", icon: Search, href: "/seller/listing-browse", badge: null },
	{ labelKey: "sentQuotes", key: "quotes", icon: Send, href: "/seller/quote-submit", badge: null },
	{ labelKey: "quoteTemplates", key: "quote-templates", icon: FileText, href: "/seller/quote-templates", badge: null },
	{ labelKey: "chat", key: "chat", icon: MessageSquare, href: "/seller/chat", badge: null },
	{ labelKey: "contract", key: "contract", icon: FileCheck, href: "/seller/contract", badge: null },
	{ labelKey: "profile", key: "profile", icon: Building2, href: "/seller/profile/edit", badge: null },
	{ labelKey: "plans", key: "plans", icon: Sparkles, href: "/plans", badge: null },
	{ labelKey: "support", key: "support", icon: HelpCircle, href: "/support", badge: null },
];

export function Sidebar({ role, companyName, name }: SidebarProps) {
	const t = useTranslations("Sidebar");
	const pathname = usePathname();
	const router = useRouter();
	const menuItems = role === "seller" ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS;
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const initial = name.charAt(0) || companyName.charAt(0) || "?";

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
		<aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border z-40">
			{/* 프로필 블록 */}
			<div className="px-3 py-4 border-b border-sidebar-border relative">
				<div className="flex items-center gap-2 px-2">
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
						className="relative flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 outline-none hover:bg-black/5 transition-colors cursor-pointer"
					>
						{/* 아바타 */}
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
							{initial}
						</div>
						{/* 이름 + 회사 */}
						<div className="min-w-0 flex-1 text-left">
							<p className="truncate text-sm font-semibold text-sidebar-foreground">{name || companyName}</p>
							<p className="truncate text-xs text-sidebar-foreground/60">{companyName}</p>
						</div>

						{/* 드롭다운 */}
						{dropdownOpen && (
							<div
								onClick={(e) => e.stopPropagation()}
								className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-white border border-[#E5E7EB] shadow-lg overflow-hidden z-50"
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

					{/* 알림/언어 - 프로필과 분리된 독립 영역 */}
					<LanguageSwitcher />
					<NotificationBell />
				</div>
			</div>

			{/* 메뉴 */}
			<nav className="flex-1 px-3 py-4 overflow-y-auto">
				<p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
					{t("menuHeading")}
				</p>
				<div className="space-y-0.5">
				{menuItems.map((item) => {
					const isActive = item.href === "#" ? false : pathname.startsWith(item.href);
					return (
						<Link
							key={item.key}
							href={item.href}
							className={cn(
								"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
								isActive
									? "bg-primary/10 text-[#111827] font-semibold"
									: "text-[#374151] hover:bg-white/70 hover:text-[#1F2937]",
							)}
						>
							<item.icon
								size={17}
								strokeWidth={2}
								className={cn(
									"shrink-0",
									isActive ? "text-[#111827]" : "text-[#9CA3AF]",
								)}
							/>
							<span className="flex-1">{t(`menu.${item.labelKey}`)}</span>
							{item.badge && (
								<span className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold bg-white/20 text-white">
									{item.badge}
								</span>
							)}
						</Link>
					);
				})}
				</div>
			</nav>
		</aside>
	);
}