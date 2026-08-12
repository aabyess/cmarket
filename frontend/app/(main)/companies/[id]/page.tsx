import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import { getPublicSite } from "@/features/siteBuilder/apis";
import { SiteRenderer } from "@/features/siteBuilder/components/SiteRenderer";

type CompanyPageProps = {
	params: Promise<{ id: string }>;
};

export default async function CompanyProfilePage({
	params,
}: CompanyPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const site = await getPublicSite(id);
	if (!site) notFound();

	return (
		<div className="px-8 py-6 xl:px-12">
			{site.isPublished ? (
				<SiteRenderer blocks={site.blocks} />
			) : (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
					<div className="flex items-center gap-4">
						{site.logoUrl ? (
							<img
								src={site.logoUrl}
								alt={site.company.companyName}
								className="size-20 rounded-xl object-cover"
							/>
						) : (
							<div className="flex size-20 items-center justify-center rounded-xl bg-[#F3F4F6]">
								<Building2 size={32} className="text-[#9CA3AF]" />
							</div>
						)}
						<div>
							<h1 className="text-2xl font-bold text-[#1F2937]">{site.company.companyName}</h1>
							<p className="mt-1 text-sm text-[#6B7280]">
								{[site.company.businessType, site.company.businessItem].filter(Boolean).join(" · ")}
							</p>
						</div>
					</div>

					<p className="mt-6 text-sm text-[#9CA3AF]">
						이 기업은 아직 회사 소개 페이지를 등록하지 않았습니다.
					</p>
				</div>
			)}
		</div>
	);
}
