import { DashboardHome } from "@/features/buyer/components/DashboardHome";
import { getBuyerCompanyName, getBuyerDashboardData } from "@/features/buyer/apis";

export default async function BuyerDashboardPage() {
	const [companyName, data] = await Promise.all([
		getBuyerCompanyName(),
		getBuyerDashboardData(),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<DashboardHome companyName={companyName} data={data} />
		</div>
	);
}