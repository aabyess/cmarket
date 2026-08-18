// features/landing/components/LandingPage/LandingPageRoles.tsx
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

export async function LandingPageRoles(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");

	const roles = [
		{
			countryCode: "ID",
			title: t("buyerTitle"),
			description: t("buyerDesc"),
			points: [t("buyerPoint1"), t("buyerPoint2"), t("buyerPoint3")],
		},
		{
			countryCode: "KR",
			title: t("sellerTitle"),
			description: t("sellerDesc"),
			points: [t("sellerPoint1"), t("sellerPoint2"), t("sellerPoint3")],
		},
	];

	return (
		<section className="border-landing-line border-t bg-white">
			<div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
				<LandingPageReveal>
					<p className="font-landing-doc text-landing-dim text-xs font-medium tracking-[0.18em] uppercase">
						Buyer ↔ Supplier
					</p>
					<h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight">{t("rolesTitle")}</h2>
				</LandingPageReveal>

				<div className="mt-12 grid gap-4 lg:grid-cols-2">
					{roles.map((role, i) => (
						<LandingPageReveal key={role.title} delay={i * 0.1} className="h-full">
							<div className="border-landing-line bg-landing-paper flex h-full flex-col rounded-lg border p-7">
								<div className="flex items-center gap-3.5">
									<span className="font-landing-doc border-landing-ink/20 flex size-10 shrink-0 items-center justify-center rounded-sm border text-xs font-semibold">
										{role.countryCode}
									</span>
									<div>
										<p className="text-lg font-bold">{role.title}</p>
										<p className="text-landing-dim text-sm">{role.description}</p>
									</div>
								</div>
								<ul className="divide-landing-line border-landing-line mt-6 flex-1 divide-y border-y">
									{role.points.map((point) => (
										<li key={point} className="flex items-start gap-3 py-3 text-sm">
											<span aria-hidden className="font-landing-doc text-landing-dim">
												—
											</span>
											{point}
										</li>
									))}
								</ul>
								<Link
									href="/signup"
									className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold transition-[gap] hover:gap-2.5">
									{t("rolesCta")}
									<ArrowRight size={14} />
								</Link>
							</div>
						</LandingPageReveal>
					))}
				</div>
			</div>
		</section>
	);
}
