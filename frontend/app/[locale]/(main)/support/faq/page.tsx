import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SupportFaq } from "@/features/support/components/SupportFaq";

export default async function SupportFaqPage(): Promise<React.JSX.Element> {
	const t = await getTranslations("SupportFaqPage");

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				{t("backToSupport")}
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{t("subtitle")}</p>
			</div>

			<SupportFaq />
		</div>
	);
}
