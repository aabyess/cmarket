import { notFound } from "next/navigation";
import { getSiteEditorData } from "@/features/siteBuilder/apis";
import { SiteBuilder } from "@/features/siteBuilder/components/SiteBuilder";

type SellerSiteEditPageProps = {
	searchParams: Promise<{ tab?: string }>;
};

export default async function SellerSiteEditPage({
	searchParams,
}: SellerSiteEditPageProps): Promise<React.JSX.Element> {
	const [data, { tab }] = await Promise.all([getSiteEditorData(), searchParams]);
	if (!data) notFound();

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">기업 홈페이지</h1>
				<p className="mt-1 text-sm text-[#6B7280]">
					블록을 조립해 바이어에게 보여질 회사 소개 페이지를 만들어보세요
				</p>
			</div>
			<SiteBuilder role="seller" data={data} initialTab={tab === "settings" ? "SETTINGS" : "PAGE"} />
		</div>
	);
}
