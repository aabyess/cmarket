// features/landing/components/LandingPage/LandingPageJourney.tsx
import { getLocale, getTranslations } from "next-intl/server";
import { cn } from "@/utils/cn";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

/** Steps와 같은 문서 코드를 재사용 — 같은 서류가 여기서는 실제로 오가는 순간으로
 * 다시 등장한다는 걸 시각적으로 잇는다. */
const JOURNEY_DOC_CODES = ["RFQ", "QUOTATION", "CONTRACT", "INVOICE", "BAST"];

/** 이 플랫폼의 축은 한국↔인도네시아라, 보고 있는 언어가 인도네시아어가 아닌 한
 * 상대 언어는 항상 인도네시아어로 고정한다 — 영어로 보고 있어도 "인도네시아어와
 * 겹쳐 있다가 정리되는" 장면 자체가 이 제품의 정체성이기 때문. */
function getPartnerLocale(locale: string): string {
	return locale === "id" ? "ko" : "id";
}

export async function LandingPageJourney(): Promise<React.JSX.Element> {
	const [t, locale] = await Promise.all([getTranslations("Landing"), getLocale()]);
	const tPartner = await getTranslations({
		locale: getPartnerLocale(locale),
		namespace: "Landing",
	});

	const items = [1, 2, 3, 4, 5].map((n, i) => ({
		code: JOURNEY_DOC_CODES[i],
		day: t(`journey${n}Day`),
		title: t(`journey${n}Title`),
		partnerTitle: tPartner(`journey${n}Title`),
		detail: t(`journey${n}Detail`),
	}));
	const lastIndex = items.length - 1;

	return (
		<section className="border-landing-line border-t bg-white">
			<div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
				<LandingPageReveal>
					<h2 className="max-w-xl text-3xl font-bold tracking-tight">{t("journeyTitle")}</h2>
					<p className="text-landing-dim mt-3 text-sm">{t("journeySubtitle")}</p>
				</LandingPageReveal>

				<div className="mt-14 max-w-2xl space-y-14">
					{items.map((item, i) => {
						const isFinal = i === lastIndex;
						return (
							<LandingPageReveal key={item.title} delay={i * 0.05}>
								<span className="font-landing-doc text-landing-dim text-[11px] font-semibold tracking-[0.14em] uppercase">
									{item.day}
								</span>
								<div className="relative mt-2">
									<p
										aria-hidden
										className="landing-journey-partner text-landing-dim pointer-events-none absolute top-0 left-0 text-base leading-snug font-semibold italic">
										{item.partnerTitle}
									</p>
									<p className="landing-journey-primary relative text-base leading-snug font-semibold">
										{item.title}
									</p>
								</div>
								<p
									className={cn(
										"font-landing-doc mt-2 text-xs tracking-wide",
										isFinal ? "text-landing-gold" : "text-landing-dim",
									)}>
									{item.code} · {item.detail}
								</p>
							</LandingPageReveal>
						);
					})}
				</div>
			</div>
		</section>
	);
}
