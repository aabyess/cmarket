import { DashboardHome } from "@/features/seller/components/DashboardHome";
import { getSellerCompanyName, getSellerDashboardData, getRecommendedListings } from "@/features/seller/serverApis";

export default async function SellerDashboardPage() {
	const [companyName, data, recommendedListings] = await Promise.all([
		getSellerCompanyName(),
		getSellerDashboardData(),
		getRecommendedListings(),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<DashboardHome companyName={companyName} data={data} recommendedListings={recommendedListings} />
		</div>
	);
}