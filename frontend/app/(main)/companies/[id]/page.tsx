import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { PublicSiteView } from "@/features/siteBuilder/components/PublicSite";
import { getPublicSite } from "@/features/siteBuilder/apis";

type CompanyPageProps = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ from?: string }>;
};

export default async function CompanyProfilePage({
	params,
	searchParams,
}: CompanyPageProps): Promise<React.JSX.Element> {
	const [{ id }, { from }] = await Promise.all([params, searchParams]);
	const site = await getPublicSite(id);
	if (!site) notFound();

	const isFromListing = typeof from === "string" && from.startsWith("/");

	return (
		<PublicSiteView
			site={site}
			backHref={isFromListing ? from : "/buyer/quote-review"}
			backLabel="받은 견적으로"
		/>
	);
}
