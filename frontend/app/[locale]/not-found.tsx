import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
	const t = await getTranslations("NotFoundPage");

	return (
		<main
			className="flex min-h-screen flex-col items-center justify-center gap-6"
			style={{ backgroundColor: "#F0F5FF" }}
		>
			<div className="text-center space-y-3">
				<p className="text-8xl font-bold text-imsg-blue">404</p>
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="text-sm text-[#6B7280]">{t("description")}</p>
			</div>
			<Link
				href="/"
				className="px-6 py-3 rounded-xl bg-imsg-blue hover:bg-[#2563EB] text-white font-semibold text-sm transition-colors"
			>
				{t("backHome")}
			</Link>
		</main>
	);
}