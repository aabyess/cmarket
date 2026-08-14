import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSiteEditorData } from "@/features/siteBuilder/apis";
import { SiteBuilder } from "@/features/siteBuilder/components/SiteBuilder";

type BuyerSiteEditPageProps = {
	searchParams: Promise<{ tab?: string }>;
};

export default async function BuyerSiteEditPage({
	searchParams,
}: BuyerSiteEditPageProps): Promise<React.JSX.Element> {
	const [data, { tab }, t] = await Promise.all([
		getSiteEditorData(),
		searchParams,
		getTranslations("BuyerProfileEditPage"),
	]);
	if (!data) notFound();

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("subtitle")}</p>
			</div>
			<SiteBuilder role="buyer" data={data} initialTab={tab === "settings" ? "SETTINGS" : "PAGE"} />
		</div>
	);
}
