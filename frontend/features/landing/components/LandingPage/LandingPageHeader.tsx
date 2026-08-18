// features/landing/components/LandingPage/LandingPageHeader.tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";

export async function LandingPageHeader(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");

	return (
		<header className="border-landing-line bg-landing-paper/90 sticky top-0 z-40 border-b backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
				<Link href="/" className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
					MitraPay
					<span aria-hidden className="bg-landing-gold mt-1 size-1.5 rounded-[1px]" />
				</Link>
				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<Link
						href="/login"
						className="text-landing-dim hover:text-landing-ink rounded-md px-3.5 py-2 text-sm font-medium transition-colors">
						{t("headerLogin")}
					</Link>
					<Link
						href="/signup"
						className="bg-landing-accent hover:bg-landing-ink rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors">
						{t("headerSignup")}
					</Link>
				</div>
			</div>
		</header>
	);
}
