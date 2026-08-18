// features/landing/components/LandingPage/index.tsx
import { getTranslations } from "next-intl/server";
import { cn } from "@/utils/cn";
import { landingMono, landingSans } from "@/features/landing/fonts";
import { LandingPageHeader } from "@/features/landing/components/LandingPage/LandingPageHeader";
import { LandingPageHero } from "@/features/landing/components/LandingPage/LandingPageHero";
import { LandingPageSteps } from "@/features/landing/components/LandingPage/LandingPageSteps";
import { LandingPageRoles } from "@/features/landing/components/LandingPage/LandingPageRoles";
import { LandingPageTrust } from "@/features/landing/components/LandingPage/LandingPageTrust";
import { LandingPageFaq } from "@/features/landing/components/LandingPage/LandingPageFaq";
import { LandingPageFooter } from "@/features/landing/components/LandingPage/LandingPageFooter";

export async function LandingPage(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const highlights = [1, 2, 3, 4].map((n) => t(`highlight${n}`));

	return (
		<div
			className={cn(
				landingSans.variable,
				landingMono.variable,
				"font-landing bg-landing-paper text-landing-ink min-h-screen break-keep antialiased",
			)}>
			<LandingPageHeader />
			<main>
				<LandingPageHero />

				{/* 핵심 강점 띠 — 서류 명세 행 */}
				<div className="border-landing-line border-y bg-white">
					<div className="mx-auto flex max-w-6xl flex-col gap-x-10 gap-y-3 px-6 py-6 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
						{highlights.map((highlight) => (
							<p key={highlight} className="flex items-center gap-2.5 text-sm font-medium">
								<span aria-hidden className="bg-landing-ink/35 size-1.5 shrink-0 rounded-[1px]" />
								{highlight}
							</p>
						))}
					</div>
				</div>

				<LandingPageSteps />
				<LandingPageRoles />
				<LandingPageTrust />
				<LandingPageFaq />
			</main>
			<LandingPageFooter />
		</div>
	);
}
