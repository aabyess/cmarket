import { PromotionalBanner } from "@/features/buyer/components/PromotionalBanner";
import { AlertBanner } from "@/features/buyer/components/AlertBanner";
import { TradingSummary } from "@/features/buyer/components/TradingSummary";
import { QuickActions } from "@/features/buyer/components/QuickActions";
import { RecentListings } from "@/features/buyer/components/RecentListings";
import { ChatFab } from "@/features/shared/components/ChatFab";

export default function BuyerDashboardPage() {
	return (
		<div className="p-4 sm:p-6 lg:p-10 space-y-10">
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
			<ChatFab />
		</div>
	);
}