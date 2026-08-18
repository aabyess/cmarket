// features/landing/components/LandingPage/index.tsx
import { getTranslations } from "next-intl/server";
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
		<div className="min-h-screen bg-white">
			<LandingPageHeader />
			<main>
				<LandingPageHero />

				{/* 핵심 강점 띠 */}
				<div className="border-y border-[#E5E7EB] bg-white">
					<div className="mx-auto grid max-w-6xl gap-4 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
						{highlights.map((highlight) => (
							<p
								key={highlight}
								className="text-center text-sm font-semibold text-[#374151] lg:text-left">
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
