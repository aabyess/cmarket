// features/landing/components/LandingPage/LandingPageTrust.tsx
import { getTranslations } from "next-intl/server";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

export async function LandingPageTrust(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const items = [1, 2, 3].map((n) => ({
		title: t(`trust${n}Title`),
		description: t(`trust${n}Desc`),
	}));

	return (
		<section className="border-landing-line border-t">
			<div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
				<LandingPageReveal>
					<p className="font-landing-doc text-landing-dim text-xs font-medium tracking-[0.18em] uppercase">
						Records
					</p>
					<h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight">{t("trustTitle")}</h2>
					<p className="text-landing-dim mt-3 text-sm">{t("trustSubtitle")}</p>
				</LandingPageReveal>

				{/* 장부(ledger) — 기록이 남는다는 주제를 표 형식 그대로 보여준다 */}
				<div className="border-landing-ink mt-12 border-t">
					{items.map((item, i) => (
						<LandingPageReveal key={item.title} delay={i * 0.08}>
							<div className="border-landing-line grid gap-2 border-b py-6 lg:grid-cols-[110px_1fr_1.4fr] lg:gap-8 lg:py-7">
								<span className="font-landing-doc text-landing-dim pt-0.5 text-xs">
									{`REC-0${i + 1}`}
								</span>
								<p className="text-base font-bold">{item.title}</p>
								<p className="text-landing-dim text-sm leading-relaxed">{item.description}</p>
							</div>
						</LandingPageReveal>
					))}
				</div>
			</div>
		</section>
	);
}
