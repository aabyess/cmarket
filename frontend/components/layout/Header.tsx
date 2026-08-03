"use client";

import { Bell, MessageSquare, User, LogOut, Settings, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogout } from "@/features/auth/mutations";
import { createClient } from "@/libs/supabase";

export function Header() {
	const router = useRouter();
	const { mutateAsync: logout } = useLogout();
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showLanguageMenu, setShowLanguageMenu] = useState(false);
	const [userEmail, setUserEmail] = useState<string | null>(null);

	useEffect(() => {
		const supabase = createClient();
		supabase.auth.getUser().then(({ data }) => {
			setUserEmail(data.user?.email ?? null);
		});
	}, []);

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	const emailPrefix = userEmail?.split("@")[0] ?? "";

	return (
		<header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 z-30 lg:left-64">
			<div className="flex items-center gap-2 text-sm text-[#6B7280]">
				<span className="font-medium">대시보드</span>
				<span className="text-[#D1D5DB]">/</span>
				<span>현재페이지</span>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative">
					<button
						onClick={() => setShowLanguageMenu(!showLanguageMenu)}
						className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg transition-colors text-[#6B7280] hover:text-[#4F46E5] hover:border-[#4F46E5] text-sm">
						<Globe size={16} />
						<span>한국어</span>
						<span className="text-xs">▾</span>
					</button>
					{showLanguageMenu && (
						<div className="absolute right-0 mt-2 w-40 bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden z-50">
							{["한국어", "English", "Bahasa Indonesia"].map((lang) => (
								<button key={lang} className="w-full text-left px-4 py-2 text-sm text-[#374151] hover:bg-gray-50 transition-colors">
									{lang}
								</button>
							))}
						</div>
					)}
				</div>

				<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#6B7280] hover:text-[#4F46E5]">
					<MessageSquare size={20} />
				</button>

				<button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors text-[#6B7280] hover:text-[#4F46E5]">
					<Bell size={20} />
					<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
				</button>

				<div className="relative">
					<button
						onClick={() => setShowUserMenu(!showUserMenu)}
						className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
						<div className="w-8 h-8 bg-linear-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
							{emailPrefix.slice(0, 2).toUpperCase()}
						</div>
					</button>
					{showUserMenu && (
						<div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden z-50">
							<div className="px-4 py-3 border-b border-[#E5E7EB] bg-gray-50">
								<p className="text-sm font-semibold text-[#1F2937]">{emailPrefix}</p>
								<p className="text-xs text-[#6B7280]">{userEmail}</p>
							</div>
							<div className="px-2 py-2 space-y-1">
								<button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#374151] hover:bg-gray-50 rounded-lg transition-colors">
									<User size={16} />
									프로필
								</button>
								<button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#374151] hover:bg-gray-50 rounded-lg transition-colors">
									<Settings size={16} />
									설정
								</button>
								<hr className="my-1 border-[#E5E7EB]" />
								<button
									onClick={handleLogout}
									className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
									<LogOut size={16} />
									로그아웃
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}