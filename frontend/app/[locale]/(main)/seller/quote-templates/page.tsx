// app/[locale]/(main)/seller/quote-templates/page.tsx
import { getTranslations } from "next-intl/server";
import { QuoteTemplateManager } from "@/features/quoteTemplates/components/QuoteTemplateManager";

export default async function QuoteTemplatesPage(): Promise<React.JSX.Element> {
	const t = await getTranslations("QuoteTemplatesPage");

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("subtitle")}</p>
			</div>
			<QuoteTemplateManager />
		</div>
	);
}
