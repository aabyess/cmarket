// features/landing/components/LandingPage/LandingPageSteps.tsx
import { getTranslations } from "next-intl/server";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

/** 각 단계에서 실제로 만들어지는 무역 문서 코드 (BAST = 인니 수령확인서) */
const STEP_DOC_CODES = ["RFQ", "QUOTATION", "CONTRACT", "INVOICE", "BAST"];

export async function LandingPageSteps(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const steps = [1, 2, 3, 4, 5].map((n, i) => ({
		code: STEP_DOC_CODES[i],
		title: t(`step${n}Title`),
		description: t(`step${n}Desc`),
	}));

	return (
		<section>
			<div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
				<LandingPageReveal>
					<p className="font-landing-doc text-landing-dim text-xs font-medium tracking-[0.18em] uppercase">
						Paper Trail
					</p>
					<h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight">{t("stepsTitle")}</h2>
					<p className="text-landing-dim mt-3 text-sm">{t("stepsSubtitle")}</p>
				</LandingPageReveal>

				<ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{steps.map((step, i) => (
						<li key={step.title}>
							<LandingPageReveal delay={i * 0.08} className="h-full">
								<div className="border-landing-line flex h-full flex-col rounded-lg border bg-white">
									<div className="border-landing-line flex items-center justify-between border-b border-dashed px-4 py-2.5">
										<span className="font-landing-doc text-[11px] font-semibold tracking-[0.1em]">
											{step.code}
										</span>
										<span className="font-landing-doc text-landing-dim text-[11px]">
											{`0${i + 1} / 05`}
										</span>
									</div>
									<div className="px-4 pt-3.5 pb-4">
										<p className="text-sm font-semibold">{step.title}</p>
										<p className="text-landing-dim mt-1.5 text-xs leading-relaxed">
											{step.description}
										</p>
									</div>
								</div>
							</LandingPageReveal>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
