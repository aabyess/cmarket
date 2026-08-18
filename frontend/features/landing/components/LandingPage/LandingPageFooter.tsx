// features/landing/components/LandingPage/LandingPageFooter.tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function LandingPageFooter(): Promise<React.JSX.Element> {
	const [t, tCommon] = await Promise.all([getTranslations("Landing"), getTranslations("Common")]);

	return (
		<footer className="border-landing-line border-t">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
				<p className="flex items-center gap-1.5 text-sm font-bold tracking-tight">
					MitraPay
					<span aria-hidden className="bg-landing-seal mt-0.5 size-1.5 rounded-[1px]" />
				</p>
				<p className="font-landing-doc text-landing-dim text-xs">{tCommon("copyright")}</p>
				<div className="text-landing-dim flex items-center gap-5 text-xs">
					<Link href="/signup/terms" className="hover:text-landing-ink transition-colors">
						{t("footerTerms")}
					</Link>
					<Link href="/login" className="hover:text-landing-ink transition-colors">
						{t("headerLogin")}
					</Link>
				</div>
			</div>
		</footer>
	);
}
