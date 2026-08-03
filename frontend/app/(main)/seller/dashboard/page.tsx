import { DashboardHome } from "@/features/seller/components/DashboardHome";
import { getSellerCompanyName, getSellerDashboardData } from "@/features/seller/serverApis";

export default async function SellerDashboardPage() {
	const [companyName, data] = await Promise.all([
		getSellerCompanyName(),
		getSellerDashboardData(),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<DashboardHome companyName={companyName} data={data} />
		</div>
	);
}