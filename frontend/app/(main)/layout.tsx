import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getServerUserRole } from "@/features/auth/serverApis";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
	const role = await getServerUserRole();

	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar role={role ?? "buyer"} />
			<div className="flex-1 lg:ml-64">
				<Header />
				<main className="pt-16">
					{children}
				</main>
			</div>
		</div>
	);
}