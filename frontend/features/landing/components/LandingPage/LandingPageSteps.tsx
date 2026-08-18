// features/landing/components/LandingPage/LandingPageSteps.tsx
import { getTranslations } from "next-intl/server";
import { ClipboardList, Scale, FileCheck, Banknote, PackageCheck } from "lucide-react";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

const STEP_ICONS = [ClipboardList, Scale, FileCheck, Banknote, PackageCheck];

export async function LandingPageSteps(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const steps = [1, 2, 3, 4, 5].map((n, i) => ({
		Icon: STEP_ICONS[i],
		title: t(`step${n}Title`),
		description: t(`step${n}Desc`),
	}));

	return (
		<section className="bg-imsg-surface">
			<div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
				<LandingPageReveal>
					<h2 className="text-center text-3xl font-bold text-[#1F2937]">{t("stepsTitle")}</h2>
					<p className="mt-3 text-center text-sm text-[#6B7280]">{t("stepsSubtitle")}</p>
				</LandingPageReveal>

				<div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{steps.map((step, i) => (
						<LandingPageReveal key={step.title} delay={i * 0.08}>
							<div className="h-full rounded-2xl border border-[#E5E7EB] bg-white p-5">
								<div className="flex items-center justify-between">
									<span className="bg-imsg-blue/10 text-imsg-blue flex size-10 items-center justify-center rounded-xl">
										<step.Icon size={18} />
									</span>
									<span className="text-2xl font-bold text-[#E5E7EB]">{i + 1}</span>
								</div>
								<p className="mt-4 text-sm font-semibold text-[#1F2937]">{step.title}</p>
								<p className="mt-1.5 text-xs leading-relaxed text-[#6B7280]">{step.description}</p>
							</div>
						</LandingPageReveal>
					))}
				</div>
			</div>
		</section>
	);
}
