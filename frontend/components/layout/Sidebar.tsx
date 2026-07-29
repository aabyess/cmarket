"use client";

import React, { useState } from "react";
import { Menu, X, LayoutDashboard, FileText, ListTodo, TrendingUp, HelpCircle, ChevronDown } from "lucide-react";
type SidebarProps = {
	collapsed?: boolean;
	onCollapse?: (collapsed: boolean) => void;
};

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(collapsed);
	const [expandedSubMenu, setExpandedSubMenu] = useState<number | null>(null);

	const handleToggle = (): void => {
		setIsCollapsed(!isCollapsed);
		onCollapse?.(!isCollapsed);
	};

	const menuItems = [
		{ label: "대시보드", key: "dashboard", icon: LayoutDashboard, href: "#", active: true },
		{ label: "견적 등록", key: "quotes", icon: FileText, href: "#" },
		{ label: "공고 등록", key: "listings", icon: ListTodo, href: "#" },
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

	return (
		<>
			<button
				onClick={handleToggle}
				className="lg:hidden fixed top-4 left-4 z-50 p-2 hover:bg-gray-100 rounded-lg text-gray-700">
				{isCollapsed ? <Menu size={24} /> : <X size={24} />}
			</button>

			<aside className="fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] z-40 w-64 hidden lg:flex flex-col">
				<nav className="flex flex-col h-full p-5">
					<div className="mb-10 flex items-center gap-3">
						<div className="w-8 h-8 bg-linear-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center">
							<div
								className="w-4 h-4 bg-white"
								style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}></div>
						</div>
						<span className="font-bold text-lg text-[#4F46E5]">C-Market</span>
					</div>

					<div className="flex-1 space-y-1">
						{menuItems.map((item, idx) => (
							<div key={item.key}>
								{item.subItems ? (
									<div>
										<button
											onClick={() =>
												setExpandedSubMenu(expandedSubMenu === idx ? null : idx)
											}
											className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-sm font-medium gap-3 ${
												expandedSubMenu === idx
													? "bg-[#EEF2FF] text-[#4F46E5]"
													: "text-[#374151] hover:bg-gray-50"
											}`}>
											<div className="flex items-center gap-3">
												<item.icon
													size={18}
													className={
														expandedSubMenu === idx ? "text-[#4F46E5]" : "text-[#9CA3AF]"
													}
												/>
												{item.label}
											</div>
											<ChevronDown
												size={16}
												className={`transition-transform shrink-0 ${
													expandedSubMenu === idx ? "rotate-180 text-[#4F46E5]" : "text-[#9CA3AF]"
												}`}
											/>
										</button>
										{expandedSubMenu === idx && (
											<div className="pl-11 mt-2 space-y-2">
												{item.subItems.map((subItem) => (
													<a
														key={subItem.key}
														href={subItem.href}
														className="flex items-center gap-2 px-3 py-2 text-[#374151] hover:bg-gray-50 rounded-lg text-sm transition-colors">
														<div className="w-1 h-1 bg-[#9CA3AF] rounded-full"></div>
														{subItem.label}
													</a>
												))}
											</div>
										)}
									</div>
								) : (
									<a
										href={item.href}
										className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
											item.active
												? "bg-[#EEF2FF] text-[#4F46E5]"
												: "text-[#374151] hover:bg-gray-50"
										}`}>
										<item.icon
											size={18}
											className={item.active ? "text-[#4F46E5]" : "text-[#9CA3AF]"}
										/>
										{item.label}
									</a>
								)}
							</div>
						))}
					</div>

					<div className="text-xs text-[#9CA3AF] text-center pt-4 border-t border-[#E5E7EB]">
						<p>v1.0.0</p>
					</div>
				</nav>
			</aside>

			{!isCollapsed && (
				<div
					className="fixed inset-0 bg-black/20 z-30 lg:hidden"
					onClick={() => setIsCollapsed(true)}></div>
			)}
		</>
	);
}