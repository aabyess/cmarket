// features/landing/components/LandingPage/LandingPageFaq.tsx
import { getTranslations } from "next-intl/server";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

export async function LandingPageFaq(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const faqs = [1, 2, 3, 4].map((n) => ({
		question: t(`faq${n}Q`),
		answer: t(`faq${n}A`),
	}));

	return (
		<section className="border-landing-line border-t bg-white">
			<div className="mx-auto max-w-3xl px-6 py-20 lg:py-24">
				<LandingPageReveal>
					<h2 className="text-3xl font-bold tracking-tight">{t("faqTitle")}</h2>
				</LandingPageReveal>

				<div className="border-landing-ink mt-8 border-t">
					{faqs.map((faq) => (
						<LandingPageReveal key={faq.question}>
							<details className="group border-landing-line border-b">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-sm font-semibold">
									{faq.question}
									<ChevronDown
										size={16}
										className="text-landing-dim shrink-0 transition-transform group-open:rotate-180"
									/>
								</summary>
								<p className="text-landing-dim pb-5 text-sm leading-relaxed">{faq.answer}</p>
							</details>
						</LandingPageReveal>
					))}
				</div>

				{/* 최종 CTA — 서류 위 도장처럼 닫는 잉크 패널 */}
				<LandingPageReveal>
					<div className="bg-landing-ink relative mt-20 overflow-hidden rounded-lg px-8 py-14 text-center">
						<span
							aria-hidden
							className="landing-stamp-impact font-landing-doc border-landing-gold/60 text-landing-gold/70 pointer-events-none absolute -top-7 -right-7 flex size-36 -rotate-12 flex-col items-center justify-center rounded-full border-2 text-[10px] font-semibold tracking-[0.22em] uppercase">
							MitraPay
							<span className="mt-1 tracking-[0.14em]">KR – ID</span>
						</span>
						<h2 className="text-landing-paper text-2xl font-bold lg:text-3xl">{t("finalTitle")}</h2>
						<p className="text-landing-paper/70 mt-3 text-sm">{t("finalSubtitle")}</p>
						<div className="mt-8 flex flex-col items-center gap-3.5">
							<Link
								href="/signup"
								className="bg-landing-paper text-landing-ink inline-flex items-center gap-2 rounded-md px-8 py-3.5 text-sm font-bold transition-colors hover:bg-white">
								{t("finalButton")}
								<ArrowRight size={16} />
							</Link>
							<Link
								href="/login"
								className="font-landing-doc text-landing-paper/60 hover:text-landing-paper text-xs transition-colors">
								{t("finalLogin")}
							</Link>
						</div>
					</div>
				</LandingPageReveal>
			</div>
		</section>
	);
}
