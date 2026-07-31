// components/layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
	Menu, X, LayoutDashboard, FileText,
	ListTodo, TrendingUp, HelpCircle, ChevronDown,
} from "lucide-react";

type SidebarProps = {
	collapsed?: boolean;
	onCollapse?: (collapsed: boolean) => void;
};

const MENU_ITEMS = [
	{ label: "대시보드", key: "dashboard", icon: LayoutDashboard, href: "/buyer/dashboard" },
	{ label: "견적 등록", key: "quotes", icon: FileText, href: "/seller/quote-submit" },
	{ label: "공고 등록", key: "listings", icon: ListTodo, href: "/buyer/post-listing" },
	{
		label: "나의 거래 관리",
		key: "transaction",
		icon: TrendingUp,
		subItems: [
			{ label: "진행", key: "active", href: "#" },
			{ label: "마감", key: "completed", href: "#" },
		],
	},
	{ label: "지원센터", key: "support", icon: HelpCircle, href: "#" },
];

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(collapsed);
	const [expandedSubMenu, setExpandedSubMenu] = useState<number | null>(null);
	const pathname = usePathname();

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
					<div className="mb-4 flex flex-col items-center gap-1">
					<Image
						src="/images/MitraPay.png"
						alt="SantaraPay 로고"
						width={180}
						height={80}
						priority
					/>
						<span className="text-xs text-[#9CA3AF] font-medium tracking-widest uppercase">
							Korea × Indonesia
						</span>
					</div>

					{/* 메뉴 */}
					<div className="flex-1 space-y-1">
						{MENU_ITEMS.map((item, idx) => {
							const isActive = pathname === item.href;
							const isExpanded = expandedSubMenu === idx;

							return (
								<div key={item.key}>
									{item.subItems ? (
										<div>
											<button
												onClick={() => setExpandedSubMenu(isExpanded ? null : idx)}
												className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm font-medium gap-3 ${
													isExpanded
														? "bg-[#EFF6FF] text-[#3B82F6]"
														: "text-[#374151] hover:bg-gray-50"
												}`}
											>
												<div className="flex items-center gap-3">
													<item.icon
														size={18}
														className={isExpanded ? "text-[#3B82F6]" : "text-[#9CA3AF]"}
													/>
													{item.label}
												</div>
												<ChevronDown
													size={16}
													className={`transition-transform shrink-0 ${
														isExpanded ? "rotate-180 text-[#3B82F6]" : "text-[#9CA3AF]"
													}`}
												/>
											</button>
											{isExpanded && (
												<div className="pl-11 mt-1 space-y-1">
													{item.subItems.map((subItem) => (
														<Link
															key={subItem.key}
															href={subItem.href}
															className="flex items-center gap-2 px-3 py-2 text-[#374151] hover:bg-gray-50 rounded-lg text-sm transition-colors"
														>
															<div className="w-1 h-1 bg-[#9CA3AF] rounded-full" />
															{subItem.label}
														</Link>
													))}
												</div>
											)}
										</div>
									) : (
										<Link
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
									)}
								</div>
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