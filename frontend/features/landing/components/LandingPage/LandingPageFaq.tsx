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
		<section className="bg-white">
			<div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
				<LandingPageReveal>
					<h2 className="text-center text-3xl font-bold text-[#1F2937]">{t("faqTitle")}</h2>
				</LandingPageReveal>

				<div className="mt-10 space-y-3">
					{faqs.map((faq) => (
						<LandingPageReveal key={faq.question}>
							<details className="group rounded-2xl border border-[#E5E7EB] bg-white px-6 py-4">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#1F2937]">
									{faq.question}
									<ChevronDown
										size={16}
										className="shrink-0 text-[#9CA3AF] transition-transform group-open:rotate-180"
									/>
								</summary>
								<p className="mt-3 text-sm leading-relaxed text-[#6B7280]">{faq.answer}</p>
							</details>
						</LandingPageReveal>
					))}
				</div>

				{/* 최종 CTA */}
				<LandingPageReveal>
					<div className="bg-imsg-blue mt-16 rounded-3xl px-8 py-12 text-center">
						<h2 className="text-2xl font-bold text-white lg:text-3xl">{t("finalTitle")}</h2>
						<p className="mt-3 text-sm text-white/80">{t("finalSubtitle")}</p>
						<div className="mt-7 flex flex-col items-center gap-3">
							<Link
								href="/signup"
								className="text-imsg-blue inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold transition-opacity hover:opacity-90">
								{t("finalButton")}
								<ArrowRight size={16} />
							</Link>
							<Link href="/login" className="text-xs text-white/70 hover:text-white">
								{t("finalLogin")}
							</Link>
						</div>
					</div>
				</LandingPageReveal>
			</div>
		</section>
	);
}
