// features/landing/components/LandingPage/LandingPageJourney.tsx
import { getTranslations } from "next-intl/server";
import { cn } from "@/utils/cn";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

/** Steps와 같은 문서 코드를 재사용 — 같은 서류가 이번엔 "공간적 나열"이 아니라
 * "시간순 장부"로 다시 등장한다는 걸 시각적으로 잇는다. */
const JOURNEY_DOC_CODES = ["RFQ", "QUOTATION", "CONTRACT", "INVOICE", "BAST"];

export async function LandingPageJourney(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const items = [1, 2, 3, 4, 5].map((n, i) => ({
		code: JOURNEY_DOC_CODES[i],
		day: t(`journey${n}Day`),
		title: t(`journey${n}Title`),
		detail: t(`journey${n}Detail`),
	}));
	const lastIndex = items.length - 1;

	return (
		<section className="border-landing-line border-t bg-white">
			<div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
				<LandingPageReveal>
					<p className="font-landing-doc text-landing-dim text-xs font-medium tracking-[0.18em] uppercase">
						The Ledger
					</p>
					<h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight">{t("journeyTitle")}</h2>
					<p className="text-landing-dim mt-3 text-sm">{t("journeySubtitle")}</p>
				</LandingPageReveal>

				<div className="landing-journey-track relative mt-14 max-w-xl">
					<div aria-hidden className="landing-journey-line absolute top-1 bottom-1 left-0 w-px" />
					<div
						aria-hidden
						className="landing-journey-progress absolute top-1 bottom-1 left-0 w-px"
					/>

					<ol className="relative flex flex-col gap-9">
						{items.map((item, i) => {
							const isFinal = i === lastIndex;
							return (
								<li key={item.title} className="relative pl-8">
									<span
										aria-hidden
										className={cn(
											"landing-journey-dot border-landing-line absolute top-[5px] left-0 size-2 -translate-x-1/2 rounded-full border bg-white",
											isFinal && "landing-journey-dot--final",
										)}
									/>
									<LandingPageReveal delay={i * 0.06}>
										<span className="font-landing-doc text-landing-dim text-[11px] font-semibold tracking-[0.14em] uppercase">
											{item.day}
										</span>
										<p
											className={cn(
												"landing-journey-title mt-1.5 text-base leading-snug font-semibold",
												isFinal && "landing-journey-title--final",
											)}>
											{item.title}
										</p>
										<p className="font-landing-doc text-landing-dim mt-1.5 text-xs tracking-wide">
											{item.code} · {item.detail}
										</p>
									</LandingPageReveal>
								</li>
							);
						})}
					</ol>
				</div>
			</div>
		</section>
	);
}
