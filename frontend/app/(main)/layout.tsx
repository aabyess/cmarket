import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar />
			<div className="flex-1 lg:ml-64">
				<Header />
				<main className="pt-16">
					{children}
				</main>
			</div>
		</div>
	);
}