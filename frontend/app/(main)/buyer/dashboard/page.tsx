import { DashboardHome } from "@/features/buyer/components/DashboardHome";
import { getBuyerCompanyName, getBuyerDashboardData, getBuyerTradeSummary } from "@/features/buyer/apis";

export default async function BuyerDashboardPage() {
	const [companyName, data, tradeSummary] = await Promise.all([
		getBuyerCompanyName(),
		getBuyerDashboardData(),
		getBuyerTradeSummary(),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<DashboardHome companyName={companyName} data={data} tradeSummary={tradeSummary} />
		</div>
	);
}