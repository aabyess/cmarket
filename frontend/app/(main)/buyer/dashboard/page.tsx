import { DashboardHome } from "@/features/buyer/components/DashboardHome";
import { MOCK_DASHBOARD_DATA } from "@/features/buyer/mocks";

export default function BuyerDashboardPage() {
	return (
		<div className="px-8 py-6 xl:px-12">
			<DashboardHome companyName="PT Maju Jaya" data={MOCK_DASHBOARD_DATA} />
		</div>
	);
}