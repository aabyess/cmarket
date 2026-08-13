import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, FolderOpen, LayoutDashboard, Mail } from "lucide-react";
import { getIsAdmin } from "@/features/support/serverApis";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

const MENU = [
	{ href: "/admin", label: "대시보드", icon: LayoutDashboard },
	{ href: "/admin/notices", label: "공지사항", icon: FileText },
	{ href: "/admin/resources", label: "자료실", icon: FolderOpen },
	{ href: "/admin/inquiries", label: "1:1 문의", icon: Mail },
];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}): Promise<React.JSX.Element> {
	// 미들웨어가 매 요청마다 DB에서 role을 새로 조회해 검증하고, 그 결과를 헤더로 전달한다.
	// getIsAdmin()은 그 헤더를 읽을 뿐이라 재조회는 아니지만 같은 요청 내 최신 값이다.
	if (!(await getIsAdmin())) redirect("/login");

	return (
		<div className="flex min-h-screen bg-[#F7F8F8]">
			<aside className="fixed left-0 top-0 z-40 hidden h-screen w-56 flex-col border-r border-[#E5E7EB] bg-white lg:flex">
				<div className="border-b border-[#E5E7EB] px-5 py-5">
					<p className="text-sm font-bold text-[#0f172a]">MitraPay</p>
					<p className="mt-0.5 text-xs text-imsg-secondary">운영자</p>
				</div>

				<nav className="flex-1 px-3 py-4">
					<div className="space-y-0.5">
						{MENU.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#374151] transition-colors duration-200 hover:bg-imsg-surface">
								<item.icon size={17} className="shrink-0 text-[#9CA3AF]" />
								{item.label}
							</Link>
						))}
					</div>
				</nav>

				<div className="border-t border-[#E5E7EB] px-3 py-4">
					<Link
						href="/support"
						className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-imsg-secondary transition-colors duration-200 hover:bg-imsg-surface">
						사용자 화면 보기
					</Link>
					<LogoutButton />
				</div>
			</aside>

			<div className="flex-1 lg:ml-56">
				<main>{children}</main>
			</div>
		</div>
	);
}
