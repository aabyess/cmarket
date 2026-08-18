// features/landing/components/LandingPage/LandingPageHero.tsx
import { getTranslations } from "next-intl/server";
import { ArrowRight, FileText, Languages } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

export async function LandingPageHero(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");

	return (
		<section>
			<div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
				<LandingPageReveal>
					<div>
						<p className="font-landing-doc text-landing-dim flex items-center gap-2.5 text-xs font-medium tracking-[0.18em] uppercase">
							<span aria-hidden className="bg-landing-gold size-1.5 rounded-[1px]" />
							{t("heroBadge")}
						</p>
						<h1 className="mt-5 text-4xl leading-[1.12] font-bold tracking-tight text-balance lg:text-[3.25rem]">
							{t("heroTitle")}
						</h1>

						{/* 시그니처 — 헤드라인이 상대국 언어로 자동 번역되어 도착하는 에코 라인 */}
						<LandingPageReveal delay={0.55}>
							<div className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
								<span className="font-landing-doc border-landing-accent/40 text-landing-accent inline-flex shrink-0 items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium">
									<Languages size={11} />
									{t("heroDemoTranslatedLabel")}
								</span>
								<p className="font-landing-doc text-landing-dim text-sm">{t("heroEcho")}</p>
							</div>
						</LandingPageReveal>

						<p className="text-landing-dim mt-6 max-w-lg text-base leading-relaxed">
							{t("heroSubtitle")}
						</p>

						<div className="mt-9 flex flex-col gap-3 sm:flex-row">
							<Link
								href="/signup"
								className="bg-landing-accent hover:bg-landing-ink flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold text-white transition-colors">
								{t("heroCtaBuyer")}
								<ArrowRight size={16} />
							</Link>
							<Link
								href="/signup"
								className="border-landing-ink/25 text-landing-ink hover:border-landing-ink flex items-center justify-center gap-2 rounded-md border px-6 py-3.5 text-sm font-semibold transition-colors">
								{t("heroCtaSeller")}
								<ArrowRight size={16} />
							</Link>
						</div>
						<p className="font-landing-doc text-landing-dim/80 mt-3.5 text-xs">
							{t("heroCtaHint")}
						</p>
					</div>
				</LandingPageReveal>

				{/* 자동 번역 채팅 데모 — 실제 채팅 UI 문법을 그대로 빌린 목업 */}
				<LandingPageReveal delay={0.15}>
					<div className="border-landing-line rounded-xl border bg-white shadow-[0_1px_0_rgba(27,37,64,0.04),0_16px_40px_-20px_rgba(27,37,64,0.25)]">
						<div className="border-landing-line flex items-center justify-between border-b border-dashed px-5 py-3">
							<p className="font-landing-doc text-landing-dim text-[11px] font-medium tracking-[0.14em] uppercase">
								KR ↔ ID
							</p>
							<p className="font-landing-doc text-landing-dim flex items-center gap-1.5 text-[11px]">
								<span aria-hidden className="size-1.5 rounded-full bg-[#22C55E]" />
								{t("heroDemoTranslatedLabel")}
							</p>
						</div>
						<div className="flex flex-col gap-3 p-5">
							<div className="max-w-[85%] self-start">
								<div className="bg-imsg-gray rounded-[18px] px-4 py-2.5 text-sm text-black">
									{t("heroDemoIncoming")}
								</div>
								<div className="font-landing-doc text-landing-dim mt-1.5 flex items-center gap-1 text-[11px]">
									<Languages size={11} />
									{t("heroDemoTranslatedLabel")}
								</div>
								<div className="text-landing-dim border-landing-line mt-1 w-fit rounded-[14px] border border-dashed px-3 py-1.5 text-xs">
									{t("heroDemoTranslated")}
								</div>
							</div>

							<div className="bg-imsg-blue max-w-[85%] self-end rounded-[18px] px-4 py-2.5 text-sm text-white">
								{t("heroDemoReply")}
							</div>

							<div className="border-landing-line flex max-w-[85%] items-center gap-2.5 self-end rounded-[14px] border px-4 py-3">
								<span className="border-landing-ink/20 text-landing-ink flex size-8 shrink-0 items-center justify-center rounded-sm border">
									<FileText size={14} />
								</span>
								<div className="min-w-0">
									<p className="font-landing-doc truncate text-xs font-medium">
										{t("heroDemoQuote")}
									</p>
									<p className="text-landing-dim text-xs">{t("heroDemoQuoteHint")}</p>
								</div>
							</div>
						</div>
					</div>
				</LandingPageReveal>
			</div>
		</section>
	);
}
