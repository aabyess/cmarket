"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
	Menu, X, LayoutDashboard, ListTodo, Mail, MessageSquare,
	FileCheck, HelpCircle, Search, Send, Building2,
} from "lucide-react";
import { UserBadge } from "@/components/layout/UserBadge";

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
	{ label: "대시보드", key: "dashboard", icon: LayoutDashboard, href: "/buyer/dashboard" },
	{ label: "내 공고", key: "listings", icon: ListTodo, href: "/buyer/order-list" },
	{ label: "받은 견적", key: "quotes", icon: Mail, href: "/buyer/quote-review" },
	{ label: "채팅", key: "chat", icon: MessageSquare, href: "/buyer/chat" },
	{ label: "계약 관리", key: "contract", icon: FileCheck, href: "/buyer/contract" },
	{ label: "지원센터", key: "support", icon: HelpCircle, href: "#" },
];

const SELLER_MENU_ITEMS = [
	{ label: "대시보드", key: "dashboard", icon: LayoutDashboard, href: "/seller/dashboard" },
	{ label: "공고 탐색", key: "browse", icon: Search, href: "/seller/listing-browse" },
	{ label: "보낸 견적", key: "quotes", icon: Send, href: "/seller/quote-submit" },
	{ label: "채팅", key: "chat", icon: MessageSquare, href: "/seller/chat" },
	{ label: "계약 관리", key: "contract", icon: FileCheck, href: "/seller/contract" },
	{ label: "기업 프로필", key: "profile", icon: Building2, href: "/seller/profile/edit" },
	{ label: "지원센터", key: "support", icon: HelpCircle, href: "#" },
];

export function Sidebar({ role, country, companyName, collapsed = false, onCollapse }: SidebarProps) {	const [isCollapsed, setIsCollapsed] = useState(collapsed);
	const pathname = usePathname();
	const menuItems = role === "seller" ? SELLER_MENU_ITEMS : BUYER_MENU_ITEMS;

	function handleToggle() {
		setIsCollapsed(!isCollapsed);
		onCollapse?.(!isCollapsed);
	}

	return (
		<>
			<button
				onClick={handleToggle}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 hover:bg-gray-100 rounded-lg text-gray-700"
			>
				{isCollapsed ? <Menu size={24} /> : <X size={24} />}
			</button>

			<aside className="fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] z-40 w-64 hidden lg:flex flex-col">
				<nav className="flex flex-col h-full">
					{/* 로고 영역 */}
					<div className="mb-4 flex flex-col items-center gap-2">
						<Image
							src="/images/MitraPay.png"
							alt="MitraPay 로고"
							width={180}
							height={80}
							priority
						/>
						<div className="flex flex-col items-center gap-1.5">
							<p className="max-w-[200px] truncate text-[13px] font-medium text-[#374151]">
								{companyName}
							</p>
							<UserBadge country={country} />
						</div>
					</div>

					{/* 메뉴 */}
					<div className="flex-1 space-y-1">
						{menuItems.map((item) => {
							const isActive = item.href === "#" ? false : pathname.startsWith(item.href);

							return (
								<Link
									key={item.key}
									href={item.href}
									className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
										isActive
											? "bg-[#EFF6FF] text-[#3B82F6]"
											: "text-[#374151] hover:bg-gray-50"
									}`}
								>
									<item.icon
										size={18}
										className={isActive ? "text-[#3B82F6]" : "text-[#9CA3AF]"}
									/>
									{item.label}
								</Link>
							);
						})}
					</div>

					<div className="text-xs text-[#9CA3AF] text-center pt-4 border-t border-[#E5E7EB]">
						v1.0.0
					</div>
				</nav>
			</aside>

			{!isCollapsed && (
				<div
					className="fixed inset-0 bg-black/20 z-30 lg:hidden"
					onClick={() => setIsCollapsed(true)}
				/>
			)}
		</>
	);
}