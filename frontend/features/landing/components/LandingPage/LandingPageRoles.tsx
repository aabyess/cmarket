// features/landing/components/LandingPage/LandingPageRoles.tsx
import { getTranslations } from "next-intl/server";
import { Building2, Store, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LandingPageReveal } from "@/features/landing/components/LandingPage/LandingPageReveal";

export async function LandingPageRoles(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");

	const roles = [
		{
			Icon: Building2,
			flag: "🇮🇩",
			title: t("buyerTitle"),
			description: t("buyerDesc"),
			points: [t("buyerPoint1"), t("buyerPoint2"), t("buyerPoint3")],
		},
		{
			Icon: Store,
			flag: "🇰🇷",
			title: t("sellerTitle"),
			description: t("sellerDesc"),
			points: [t("sellerPoint1"), t("sellerPoint2"), t("sellerPoint3")],
		},
	];

	return (
		<section className="bg-white">
			<div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
				<LandingPageReveal>
					<h2 className="text-center text-3xl font-bold text-[#1F2937]">{t("rolesTitle")}</h2>
				</LandingPageReveal>

				<div className="mt-12 grid gap-6 lg:grid-cols-2">
					{roles.map((role, i) => (
						<LandingPageReveal key={role.title} delay={i * 0.1}>
							<div className="h-full rounded-3xl border border-[#E5E7EB] bg-white p-8 transition-shadow hover:shadow-md">
								<div className="flex items-center gap-3">
									<span className="bg-imsg-blue/10 text-imsg-blue flex size-12 items-center justify-center rounded-2xl">
										<role.Icon size={22} />
									</span>
									<div>
										<p className="text-lg font-bold text-[#1F2937]">
											{role.flag} {role.title}
										</p>
										<p className="text-sm text-[#6B7280]">{role.description}</p>
									</div>
								</div>
								<ul className="mt-6 space-y-3">
									{role.points.map((point) => (
										<li key={point} className="flex items-start gap-2.5 text-sm text-[#374151]">
											<CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#16A34A]" />
											{point}
										</li>
									))}
								</ul>
								<Link
									href="/signup"
									className="text-imsg-blue mt-6 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline">
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
