"use client";

import { Bell, MessageSquare, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/mutations";
import { createClient } from "@/libs/supabase";
import { UserBadge } from "@/components/layout/UserBadge";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { ProfileEditModal } from "@/features/buyerProfile/components/ProfileEditModal";
import { getBreadcrumbLabel } from "@/constants/breadcrumb";

type HeaderProps = {
	country: "indonesia" | "korea";
};

export function Header({ country }: HeaderProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { mutateAsync: logout } = useLogout();
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showProfileModal, setShowProfileModal] = useState(false);
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
	const role = pathname.startsWith("/seller") ? "seller" : "buyer";
	const currentLabel = getBreadcrumbLabel(pathname);
	const isDashboard = currentLabel === "대시보드";

	function handleProfileClick(): void {
		setShowUserMenu(false);
		if (role === "buyer") {
			setShowProfileModal(true);
		} else {
			router.push("/seller/profile/edit");
		}
	}

	return (
		<header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5E7EB]/60 bg-white/80 px-8 backdrop-blur-xl lg:left-64">
			<div className="flex items-center gap-1.5 text-[13px] text-imsg-secondary">
				<button
					onClick={() => router.push(`/${role}/dashboard`)}
					className={isDashboard ? "font-medium text-[#374151]" : "transition-colors hover:text-[#374151]"}
				>
					대시보드
				</button>
				{!isDashboard && (
					<>
						<span className="text-[#D1D5DB]">/</span>
						<span className="font-medium text-[#374151]">{currentLabel}</span>
					</>
				)}
			</div>

			<div className="flex items-center gap-1">
				<button
					onClick={() => router.push(`/${role}/chat`)}
					className="flex size-9 items-center justify-center rounded-full text-imsg-secondary transition-colors hover:bg-imsg-surface hover:text-imsg-blue"
				>
					<MessageSquare size={19} strokeWidth={2} />
				</button>

				<NotificationBell country={country} />

				<UserBadge country={country} className="mx-1" />

				<div className="relative">
					<button
						onClick={() => setShowUserMenu(!showUserMenu)}
						className="flex items-center rounded-full p-0.5 transition-transform active:scale-95"
					>
						<div className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-imsg-blue to-indigo-600 text-[11px] font-semibold text-white shadow-sm">
							{emailPrefix.slice(0, 2).toUpperCase()}
						</div>
					</button>

					{showUserMenu && (
						<div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-[#E5E7EB]/60 bg-white/95 shadow-lg backdrop-blur-xl">
							<div className="border-b border-[#F3F4F6] px-4 py-3">
								<p className="text-[14px] font-semibold text-[#1F2937]">{emailPrefix}</p>
								<p className="text-[12px] text-imsg-secondary">{userEmail}</p>
							</div>
							<div className="space-y-0.5 px-1.5 py-1.5">
								<button
									onClick={handleProfileClick}
									className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[#374151] transition-colors hover:bg-imsg-surface"
								>
									<User size={15} />
									프로필
								</button>
								<button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[#374151] transition-colors hover:bg-imsg-surface">
									<Settings size={15} />
									설정
								</button>
								<div className="my-1 h-px bg-[#F3F4F6]" />
								<button
									onClick={handleLogout}
									className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
								>
									<LogOut size={15} />
									로그아웃
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			<ProfileEditModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
		</header>
	);
}