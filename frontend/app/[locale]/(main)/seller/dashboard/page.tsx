import { DashboardHome } from "@/features/seller/components/DashboardHome";
import {
	getSellerCompanyName,
	getSellerDashboardData,
	getRecommendedListings,
	getSellerTodos,
} from "@/features/seller/serverApis";
import { getOnboardingChecklist } from "@/features/onboarding/serverApis";

export default async function SellerDashboardPage() {
	const [companyName, data, recommendedListings, todos, onboardingChecklist] = await Promise.all([
		getSellerCompanyName(),
		getSellerDashboardData(),
		getRecommendedListings(),
		getSellerTodos(),
		getOnboardingChecklist("seller"),
	]);

	return (
		<DashboardHome
			companyName={companyName}
			data={data}
			recommendedListings={recommendedListings}
			todos={todos}
			onboardingChecklist={onboardingChecklist}
		/>
	);
}