import { AppShell } from "@/components/layout/AppShell";
import { Toast } from "@/components/commons/Toast";
import { getUserSummary } from "@/features/auth/serverApis";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
	const summary = await getUserSummary();

	// 운영자는 이 레이아웃에 도달하지 않는다(미들웨어가 /admin 으로 돌려보낸다).
	const role = summary?.role === "seller" ? "seller" : "buyer";
	const companyName = summary?.companyName ?? "";
	const name = summary?.name ?? "";

	return (
		<AppShell role={role} companyName={companyName} name={name}>
			{children}
			<Toast />
		</AppShell>
	);
}
