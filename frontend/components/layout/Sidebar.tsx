"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard, ListTodo, Mail, MessageSquare,
	FileCheck, HelpCircle, Search, Send, Building2, ChevronsUpDown,
} from "lucide-react";
import { UserBadge } from "@/components/layout/UserBadge";
import { cn } from "@/utils/cn";

type UserRole = "buyer" | "seller";
type UserCountry = "indonesia" | "korea";

type SidebarProps = {
	role: UserRole;
	country: UserCountry;
	companyName: string;
	collapsed?: boolean;
	onCollapse?: (collapsed: boolean) => void;
};

const BUYER_MENU_ITEMS = [
	{ label: "대시보드", key: "dashboard", icon: LayoutDashboard, href: "/buyer/dashboard", badge: null },
	{ label: "내 공고", key: "listings", icon: ListTodo, href: "/buyer/order-list", badge: null },
	{ label: "받은 견적", key: "quotes", icon: Mail, href: "/buyer/quote-review", badge: null },
	{ label: "채팅", key: "chat", icon: MessageSquare, href: "/buyer/chat", badge: null },
	{ label: "계약 관리", key: "contract", icon: FileCheck, href: "/buyer/contract", badge: null },
	{ label: "지원센터", key: "support", icon: HelpCircle, href: "#", badge: null },
];

const SELLER_MENU_ITEMS = [
	{ label: "대시보드", key: "dashboard", icon: LayoutDashboard, href: "/seller/dashboard", badge: null },
	{ label: "공고 탐색", key: "browse", icon: Search, href: "/seller/listing-browse", badge: null },
	{ label: "보낸 견적", key: "quotes", icon: Send, href: "/seller/quote-submit", badge: null },
	{ label: "채팅", key: "chat", icon: MessageSquare, href: "/seller/chat", badge: null },
	{ label: "계약 관리", key: "contract", icon: FileCheck, href: "/seller/contract", badge: null },
	{ label: "기업 프로필", key: "profile", icon: Building2, href: "/seller/profile/edit", badge: null },
	{ label: "지원센터", key: "support", icon: HelpCircle, href: "#", badge: null },
];

export function Sidebar({ role, country, companyName }: SidebarProps) {
	const pathname = usePathname();
	const menuItems = role === "seller" ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS;

	return (
		<aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col bg-white border-r border-[#e2e8f0] z-40">
			{/* 로고 */}
			<div className="flex items-center justify-center px-5 py-6">
				<Image
					src="/images/MitraPay.png"
					alt="MitraPay"
					width={160}
					height={56}
					priority
					className="object-contain"
				/>
			</div>

			{/* 메뉴 */}
			<nav className="flex-1 px-3 py-4 overflow-y-auto">
				<p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
					메뉴
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
										? "bg-[#eff6ff] text-[#3B82F6]"
										: "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]",
								)}
							>
								<item.icon
									size={17}
									strokeWidth={2}
									className={cn(
										"shrink-0",
										isActive ? "text-[#3B82F6]" : "text-[#94a3b8]",
									)}
								/>
								<span className="flex-1">{item.label}</span>
								{item.badge && (
									<span className={cn(
										"flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
										isActive
											? "bg-[#3B82F6]/20 text-[#3B82F6]"
											: "bg-[#f1f5f9] text-[#64748b]",
									)}>
										{item.badge}
									</span>
								)}
							</Link>
						);
					})}
				</div>
			</nav>

			{/* 회사 정보 */}
			<div className="border-t border-[#e2e8f0] p-3">
				<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#f8fafc]">
					<UserBadge country={country} size="lg" />
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold text-[#0f172a]">{companyName}</p>
						<p className="text-xs text-[#94a3b8]">
							{country === "indonesia" ? "Indonesia" : "Korea"} · {role === "buyer" ? "Buyer" : "Seller"}
						</p>
					</div>
				</button>
			</div>
		</aside>
	);
}