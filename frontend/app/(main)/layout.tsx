import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getUserSummary } from "@/features/auth/serverApis";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
	const summary = await getUserSummary();

	const role = summary?.role ?? "buyer";
	const country = summary?.country ?? "indonesia";
	const companyName = summary?.companyName ?? "";

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar role={role} country={country} companyName={companyName} />
			<div className="flex-1 lg:ml-64">
				<Header country={country} />
				<main className="pt-16">{children}</main>
			</div>
		</div>
	);
}