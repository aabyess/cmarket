import { PlanComparison } from "@/features/plan/components/PlanComparison";
import { getPlanInfo } from "@/features/plan/apis";

export default async function PlansPage(): Promise<React.JSX.Element> {
	const planInfo = await getPlanInfo();

	return <PlanComparison planInfo={planInfo} />;
}
