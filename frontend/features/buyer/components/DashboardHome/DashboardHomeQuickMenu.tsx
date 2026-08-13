"use client";

import { Mail, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type QuickMenuItem = {
	key: "quotes" | "chats";
	label: string;
	icon: LucideIcon;
	href: string;
};

const QUICK_MENU_ITEMS: QuickMenuItem[] = [
	{ key: "quotes", label: "받은 견적", icon: Mail, href: "/buyer/quote-review" },
	{ key: "chats", label: "채팅", icon: MessageSquare, href: "/buyer/chat" },
];

type DashboardHomeQuickMenuProps = {
	badges: { quotes: number; chats: number };
	onNavigate: (href: string) => void;
};

export function DashboardHomeQuickMenu({ badges, onNavigate }: DashboardHomeQuickMenuProps) {
	return (
		<div className="mt-2 grid grid-cols-2 gap-2">
			{QUICK_MENU_ITEMS.map((item) => {
				const badgeCount = badges[item.key];

				return (
					<button
						key={item.key}
						onClick={() => onNavigate(item.href)}
						className="relative flex flex-col items-start gap-0.5 rounded-xl border border-[#E5E7EB] bg-white p-3 transition-colors hover:bg-gray-50"
					>
						{badgeCount > 0 && (
							<span className="absolute right-2 top-2 rounded-full bg-[#EF4444] px-1.5 py-px text-xs text-white">
								{badgeCount}
							</span>
						)}
						<item.icon size={18} className="text-[#3B82F6]" />
						<span className="text-xs text-[#6B7280]">{item.label}</span>
					</button>
				);
			})}
		</div>
	);
}