import { DashboardHome } from "@/features/seller/components/DashboardHome";
import {
	getSellerCompanyName,
	getSellerDashboardData,
	getRecommendedListings,
	getSellerTodos,
} from "@/features/seller/serverApis";

export default async function SellerDashboardPage() {
	const [companyName, data, recommendedListings, todos] = await Promise.all([
		getSellerCompanyName(),
		getSellerDashboardData(),
		getRecommendedListings(),
		getSellerTodos(),
	]);

	return (
		<DashboardHome
			companyName={companyName}
			data={data}
			recommendedListings={recommendedListings}
			todos={todos}
		/>
	);
}