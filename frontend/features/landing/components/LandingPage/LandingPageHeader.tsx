// features/landing/components/LandingPage/LandingPageHeader.tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";

export async function LandingPageHeader(): Promise<React.JSX.Element> {
	const t = await getTranslations("Landing");

	return (
		<header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/80 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
				<Link href="/" className="text-lg font-bold text-[#1F2937]">
					Mitra<span className="text-imsg-blue">Pay</span>
				</Link>
				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<Link
						href="/login"
						className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB]">
						{t("headerLogin")}
					</Link>
					<Link
						href="/signup"
						className="bg-imsg-blue rounded-lg px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]">
						{t("headerSignup")}
					</Link>
				</div>
			</div>
		</header>
	);
}
