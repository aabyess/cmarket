import { useTranslations } from "next-intl";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Plan } from "@/constants/plan";
import type { PlanInfo } from "@/features/plan/apis";

type PlanComparisonProps = {
	planInfo: PlanInfo | null;
};

const PLAN_ORDER: Plan[] = ["free", "pro", "max"];

const PLAN_FEATURE_COUNT: Record<Plan, number> = {
	free: 3,
	pro: 3,
	max: 5,
};

const PLAN_HIGHLIGHT: Record<Plan, string> = {
	free: "",
	pro: "border-imsg-blue ring-1 ring-imsg-blue",
	max: "border-[#0f172a] ring-1 ring-[#0f172a]",
};

export function PlanComparison({ planInfo }: PlanComparisonProps): React.ReactNode {
	const t = useTranslations("PlanComparison");
	const currentPlan = planInfo?.plan ?? "free";

	return (
		<div className="mx-auto max-w-[1100px] px-6 py-10 lg:px-8">
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-2 text-sm text-imsg-secondary">{t("subtitle")}</p>
			</div>

			{planInfo && planInfo.chatLimit !== null && (
				<div className="mx-auto mb-8 max-w-md rounded-xl border border-[#E5E7EB] bg-white px-5 py-4">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium text-[#374151]">{t("usageLabel")}</span>
						<span className="font-semibold text-[#0f172a]">
							{planInfo.chatUsageThisMonth} / {planInfo.chatLimit}
						</span>
					</div>
					<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
						<div
							className="h-full rounded-full bg-imsg-blue"
							style={{
								width: `${Math.min(100, (planInfo.chatUsageThisMonth / planInfo.chatLimit) * 100)}%`,
							}}
						/>
					</div>
				</div>
			)}

			<div className="grid gap-5 sm:grid-cols-3">
				{PLAN_ORDER.map((plan) => {
					const isCurrent = plan === currentPlan;
					const featureCount = PLAN_FEATURE_COUNT[plan];

					return (
						<div
							key={plan}
							className={cn(
								"flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6",
								PLAN_HIGHLIGHT[plan],
							)}
						>
							{plan !== "free" && (
								<span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-imsg-blue/10 px-2.5 py-1 text-xs font-semibold text-imsg-blue">
									<Sparkles size={12} />
									{t(`${plan}.badge`)}
								</span>
							)}

							<h2 className="text-lg font-bold text-[#0f172a]">{t(`${plan}.name`)}</h2>
							<p className="mt-1 text-2xl font-bold text-[#0f172a]">{t(`${plan}.price`)}</p>
							<p className="mt-1 text-xs text-imsg-secondary">{t(`${plan}.priceDescription`)}</p>

							<ul className="mt-5 flex-1 space-y-2.5">
								{Array.from({ length: featureCount }, (_, i) => (
									<li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
										<Check size={16} className="mt-0.5 shrink-0 text-imsg-blue" />
										{t(`${plan}.feature${i + 1}`)}
									</li>
								))}
							</ul>

							<button
								disabled
								className={cn(
									"mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
									isCurrent
										? "bg-[#F3F4F6] text-[#9CA3AF]"
										: "bg-imsg-blue/10 text-imsg-blue disabled:cursor-not-allowed",
								)}
							>
								{isCurrent ? t("currentPlanButton") : t("upgradeComingSoonButton")}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
}
