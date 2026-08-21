import { DashboardHome } from "@/features/buyer/components/DashboardHome";
import { getBuyerCompanyName, getBuyerDashboardData, getBuyerTradeSummary } from "@/features/buyer/apis";
import { getOnboardingChecklist } from "@/features/onboarding/serverApis";

export default async function BuyerDashboardPage() {
	const [companyName, data, tradeSummary, onboardingChecklist] = await Promise.all([
		getBuyerCompanyName(),
		getBuyerDashboardData(),
		getBuyerTradeSummary(),
		getOnboardingChecklist("buyer"),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<DashboardHome
				companyName={companyName}
				data={data}
				tradeSummary={tradeSummary}
				onboardingChecklist={onboardingChecklist}
			/>
		</div>
	);
}