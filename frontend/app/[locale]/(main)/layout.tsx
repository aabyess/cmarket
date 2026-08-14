import { Sidebar } from "@/components/layout/Sidebar";
import { getUserSummary } from "@/features/auth/serverApis";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
	const summary = await getUserSummary();

	// 운영자는 이 레이아웃에 도달하지 않는다(미들웨어가 /admin 으로 돌려보낸다).
	const role = summary?.role === "seller" ? "seller" : "buyer";
	const companyName = summary?.companyName ?? "";
	const name = summary?.name ?? "";

	return (
		<div className="flex min-h-screen bg-[#F7F8F8]">
			<Sidebar role={role} companyName={companyName} name={name} />
			<div className="flex-1 lg:ml-64">
				<main>{children}</main>
			</div>
		</div>
	);
}