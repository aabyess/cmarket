import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AdminNoticeForm } from "@/features/support/components/AdminNoticeForm";

export default async function NewNoticePage(): Promise<React.JSX.Element> {
	const t = await getTranslations("AdminNoticeNewPage");

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8">
			<Link
				href="/admin/notices"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				{t("backToList")}
			</Link>

			<h1 className="mb-5 text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
			<AdminNoticeForm notice={null} />
		</div>
	);
}
