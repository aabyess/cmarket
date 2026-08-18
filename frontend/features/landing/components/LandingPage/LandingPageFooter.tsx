// features/landing/components/LandingPage/LandingPageFooter.tsx
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function LandingPageFooter(): Promise<React.JSX.Element> {
	const [t, tCommon] = await Promise.all([getTranslations("Landing"), getTranslations("Common")]);

	return (
		<footer className="border-t border-[#E5E7EB] bg-white">
			<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
				<p className="text-sm font-bold text-[#1F2937]">
					Mitra<span className="text-imsg-blue">Pay</span>
				</p>
				<p className="text-xs text-[#9CA3AF]">{tCommon("copyright")}</p>
				<div className="flex items-center gap-4 text-xs text-[#6B7280]">
					<Link href="/signup/terms" className="hover:text-[#1F2937]">
						{t("footerTerms")}
					</Link>
					<Link href="/login" className="hover:text-[#1F2937]">
						{t("headerLogin")}
					</Link>
				</div>
			</div>
		</footer>
	);
}
