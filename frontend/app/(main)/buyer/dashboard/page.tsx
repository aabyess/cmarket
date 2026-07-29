import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { PromotionalBanner } from "@/features/buyer/components/PromotionalBanner";
import { AlertBanner } from "@/features/buyer/components/AlertBanner";
import { TradingSummary } from "@/features/buyer/components/TradingSummary";
import { QuickActions } from "@/features/buyer/components/QuickActions";
import { RecentListings } from "@/features/buyer/components/RecentListings";
import { ChatFab } from "@/features/shared/components/ChatFab";

export default function BuyerDashboardPage() {
	return (
		<div className="flex min-h-screen bg-gray-50">
			<Sidebar />
			<main className="flex-1 pt-20 lg:pt-0 lg:ml-64">
				<Header />
				<div className="p-4 sm:p-6 lg:p-10 space-y-10 pt-24 lg:pt-20">
					<PromotionalBanner />
					<AlertBanner />
					<div className="pt-2">
						<TradingSummary />
					</div>
					<div className="pt-4">
						<QuickActions />
					</div>
					<div className="pt-4">
						<RecentListings />
					</div>
					<div className="h-12"></div>
				</div>
				<ChatFab />
			</main>
		</div>
	);
}