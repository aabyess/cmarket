import { Sidebar } from "@/components/layout/Sidebar";
import { getUserSummary } from "@/features/auth/serverApis";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
	const summary = await getUserSummary();

	const role = summary?.role ?? "buyer";
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