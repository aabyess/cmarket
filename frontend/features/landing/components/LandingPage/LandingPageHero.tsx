// features/landing/components/LandingPage/LandingPageHero.tsx
import { getTranslations } from "next-intl/server";
import { ArrowRight, FileText, Languages } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

export async function LandingPageHero(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");

	return (
		<section className="bg-white">
			<div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
				<LandingPageReveal>
					<div>
						<span className="bg-imsg-blue/10 text-imsg-blue inline-block rounded-full px-3 py-1 text-xs font-semibold">
							{t("heroBadge")}
						</span>
						<h1 className="mt-4 text-4xl leading-tight font-bold text-[#1F2937] lg:text-5xl">
							{t("heroTitle")}
						</h1>
						<p className="mt-4 max-w-lg text-base leading-relaxed text-[#6B7280]">
							{t("heroSubtitle")}
						</p>

						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Link
								href="/signup"
								className="bg-imsg-blue flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]">
								{t("heroCtaBuyer")}
								<ArrowRight size={16} />
							</Link>
							<Link
								href="/signup"
								className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-6 py-3.5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#F9FAFB]">
								{t("heroCtaSeller")}
								<ArrowRight size={16} />
							</Link>
						</div>
						<p className="mt-3 text-xs text-[#9CA3AF]">{t("heroCtaHint")}</p>
					</div>
				</LandingPageReveal>

				{/* 자동 번역 채팅 데모 — 실제 채팅 UI 문법을 그대로 빌린 목업 */}
				<LandingPageReveal delay={0.15}>
					<div className="bg-imsg-surface rounded-3xl border border-[#E5E7EB] p-6 shadow-sm">
						<div className="flex flex-col gap-3">
							<div className="max-w-[85%] self-start">
								<div className="rounded-[20px] bg-[#E9E9EB] px-4 py-2.5 text-sm text-black">
									{t("heroDemoIncoming")}
								</div>
								<div className="text-imsg-secondary mt-1.5 flex items-center gap-1 text-xs">
									<Languages size={11} />
									{t("heroDemoTranslatedLabel")}
								</div>
								<div className="text-imsg-secondary mt-1 w-fit rounded-[16px] bg-black/5 px-3 py-1.5 text-xs italic">
									{t("heroDemoTranslated")}
								</div>
							</div>

							<div className="bg-imsg-blue max-w-[85%] self-end rounded-[20px] px-4 py-2.5 text-sm text-white">
								{t("heroDemoReply")}
							</div>

							<div className="flex max-w-[85%] items-center gap-2.5 self-end rounded-[20px] bg-white px-4 py-3 shadow-sm">
								<span className="bg-imsg-blue/10 text-imsg-blue flex size-8 shrink-0 items-center justify-center rounded-lg">
									<FileText size={14} />
								</span>
								<div className="min-w-0">
									<p className="truncate text-xs font-medium text-[#1F2937]">
										{t("heroDemoQuote")}
									</p>
									<p className="text-xs text-[#9CA3AF]">{t("heroDemoQuoteHint")}</p>
								</div>
							</div>
						</div>
					</div>
				</LandingPageReveal>
			</div>
		</section>
	);
}
