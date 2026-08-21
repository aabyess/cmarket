import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { PublicSiteView } from "@/features/siteBuilder/components/PublicSite";
import { getPublicSite } from "@/features/siteBuilder/apis";
import { getCompanyReviews } from "@/features/reviews/serverApis";

const REVIEWS_FETCH_LIMIT = 30;

type CompanyPageProps = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ from?: string }>;
};

export default async function CompanyProfilePage({
	params,
	searchParams,
}: CompanyPageProps): Promise<React.JSX.Element> {
	const [{ id }, { from }] = await Promise.all([params, searchParams]);
	const [site, reviewsSummary, t] = await Promise.all([
		getPublicSite(id),
		getCompanyReviews(id, REVIEWS_FETCH_LIMIT),
		getTranslations("CompanyProfilePage"),
	]);
	if (!site) notFound();

	const isFromListing = typeof from === "string" && from.startsWith("/");

	return (
		<PublicSiteView
			site={site}
			reviewsSummary={reviewsSummary}
			backHref={isFromListing ? from : "/buyer/quote-review"}
			backLabel={t("backLabel")}
		/>
	);
}
