import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SupportInquiryForm } from "@/features/support/components/SupportInquiries/SupportInquiryForm";

export default async function NewInquiryPage(): Promise<React.JSX.Element> {
	const t = await getTranslations("SupportInquiryNewPage");

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support/inquiries"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				{t("backToList")}
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{t("subtitle")}</p>
			</div>

			<SupportInquiryForm />
		</div>
	);
}
