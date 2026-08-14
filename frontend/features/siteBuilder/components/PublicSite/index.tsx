import { Link } from "@/i18n/navigation";
import { ChevronLeft, FileText } from "lucide-react";
import { PublicSiteIdentity } from "@/features/siteBuilder/components/PublicSite/PublicSiteIdentity";
import { SiteRenderer } from "@/features/siteBuilder/components/SiteRenderer";
import type { PublicSite } from "@/features/siteBuilder/types";

type PublicSiteProps = {
	site: PublicSite;
	backHref: string;
	backLabel: string;
};

export function PublicSiteView({ site, backHref, backLabel }: PublicSiteProps): React.JSX.Element {
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
					<PublicSiteIdentity company={site.company} logoUrl={site.logoUrl} withHeading />
				</div>
			) : (
				<div className="space-y-5">
					<PublicSiteIdentity company={site.company} logoUrl={site.logoUrl} />

					<section className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
						<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
							<FileText size={20} className="text-imsg-secondary" />
						</div>
						<p className="text-base font-medium text-[#0f172a]">아직 회사 소개 페이지가 없어요</p>
						<p className="mt-1 text-sm text-imsg-secondary">
							이 기업은 소개 페이지를 등록하지 않았습니다. 위의 사업자 정보로 확인하시거나, 견적
							화면에서 직접 문의해 보세요.
						</p>
					</section>
				</div>
			)}
		</div>
	);
}
