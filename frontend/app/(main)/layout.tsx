import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getUserSummary } from "@/features/auth/serverApis";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
	const summary = await getUserSummary();

	const role = summary?.role ?? "buyer";
	const country = summary?.country ?? "indonesia";
	const companyName = summary?.companyName ?? "";

	return (
		<div className="flex min-h-screen">
			<Sidebar role={role} country={country} companyName={companyName} />
			<div className="flex min-h-screen bg-[#F2F2F7]">
				<Header country={country} />
				<main className="pt-16">{children}</main>
			</div>
		</div>
	);
}