import { getTranslations } from "next-intl/server";
import { MyQuotes } from "@/features/seller/components/MyQuotes";
import { getMyQuotes } from "@/features/seller/serverApis";

export default async function MyQuotesPage() {
	const [quotes, t] = await Promise.all([
		getMyQuotes(),
		getTranslations("SellerQuoteSubmitPage"),
	]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-5">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("subtitle", { count: quotes.length })}</p>
			</div>

			<MyQuotes quotes={quotes} />
		</div>
	);
}