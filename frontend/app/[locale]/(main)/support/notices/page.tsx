import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SupportNotices } from "@/features/support/components/SupportNotices";
import { getNotices } from "@/features/support/serverApis";

export default async function SupportNoticesPage(): Promise<React.JSX.Element> {
	const notices = await getNotices();
	const t = await getTranslations("SupportNoticesPage");

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				{t("backToSupport")}
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{t("count", { count: notices.length })}</p>
			</div>

			<SupportNotices notices={notices} />
		</div>
	);
}
