// app/[locale]/(main)/buyer/listing-templates/page.tsx
import { getTranslations } from "next-intl/server";
import { ListingTemplateManager } from "@/features/listingTemplates/components/ListingTemplateManager";

export default async function ListingTemplatesPage(): Promise<React.JSX.Element> {
	const t = await getTranslations("ListingTemplatesPage");

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("subtitle")}</p>
			</div>
			<ListingTemplateManager />
		</div>
	);
}
