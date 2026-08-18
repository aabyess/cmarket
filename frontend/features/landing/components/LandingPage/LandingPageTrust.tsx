// features/landing/components/LandingPage/LandingPageTrust.tsx
import { getTranslations } from "next-intl/server";
import { ShieldCheck, BadgeCheck, Languages } from "lucide-react";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

const TRUST_ICONS = [ShieldCheck, BadgeCheck, Languages];

export async function LandingPageTrust(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");
	const items = [1, 2, 3].map((n, i) => ({
		Icon: TRUST_ICONS[i],
		title: t(`trust${n}Title`),
		description: t(`trust${n}Desc`),
	}));

	return (
		<section className="bg-imsg-surface">
			<div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
				<LandingPageReveal>
					<h2 className="text-center text-3xl font-bold text-[#1F2937]">{t("trustTitle")}</h2>
					<p className="mt-3 text-center text-sm text-[#6B7280]">{t("trustSubtitle")}</p>
				</LandingPageReveal>

				<div className="mt-12 grid gap-6 lg:grid-cols-3">
					{items.map((item, i) => (
						<LandingPageReveal key={item.title} delay={i * 0.1}>
							<div className="h-full rounded-3xl border border-[#E5E7EB] bg-white p-8">
								<span className="flex size-12 items-center justify-center rounded-2xl bg-[#F0FDF4] text-[#16A34A]">
									<item.Icon size={22} />
								</span>
								<p className="mt-5 text-base font-bold text-[#1F2937]">{item.title}</p>
								<p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{item.description}</p>
							</div>
						</LandingPageReveal>
					))}
				</div>
			</div>
		</section>
	);
}
