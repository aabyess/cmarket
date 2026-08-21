import { Link } from "@/i18n/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PublicSiteIdentity } from "@/features/siteBuilder/components/PublicSite/PublicSiteIdentity";
import { SiteRenderer } from "@/features/siteBuilder/components/SiteRenderer";
import { CompanyReviewsSection } from "@/features/reviews/components/CompanyReviewsSection";
import type { PublicSite } from "@/features/siteBuilder/types";
import type { CompanyReviewsSummary } from "@/features/reviews/serverApis";

type PublicSiteProps = {
	site: PublicSite;
	reviewsSummary: CompanyReviewsSummary;
	backHref: string;
	backLabel: string;
};

export async function PublicSiteView({
	site,
	reviewsSummary,
	backHref,
	backLabel,
}: PublicSiteProps): Promise<React.JSX.Element> {
	const t = await getTranslations("PublicSite");

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href={backHref}
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				{backLabel}
			</Link>

			{/* 발행된 페이지가 있으면 그것이 주인공이고 사업자 정보는 아래에서 뒷받침한다.
			    미발행이면 사업자 정보가 유일한 근거이므로 위로 올린다. */}
			{site.isPublished ? (
				<div className="space-y-5">
					<SiteRenderer blocks={site.blocks} />
					<PublicSiteIdentity
						company={site.company}
						verificationStatus={site.verificationStatus}
						logoUrl={site.logoUrl}
						withHeading
					/>
					<CompanyReviewsSection
						reviews={reviewsSummary.reviews}
						totalCount={reviewsSummary.totalCount}
						averageRating={reviewsSummary.averageRating}
					/>
				</div>
			) : (
				<div className="space-y-5">
					<PublicSiteIdentity
						company={site.company}
						verificationStatus={site.verificationStatus}
						logoUrl={site.logoUrl}
					/>

					<section className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
						<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
							<FileText size={20} className="text-imsg-secondary" />
						</div>
						<p className="text-base font-medium text-[#0f172a]">{t("emptyTitle")}</p>
						<p className="mt-1 text-sm text-imsg-secondary">{t("emptyDescription")}</p>
					</section>

					<CompanyReviewsSection
						reviews={reviewsSummary.reviews}
						totalCount={reviewsSummary.totalCount}
						averageRating={reviewsSummary.averageRating}
					/>
				</div>
			)}
		</div>
	);
}
