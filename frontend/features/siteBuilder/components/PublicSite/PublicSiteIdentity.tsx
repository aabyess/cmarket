import { Building2 } from "lucide-react";
import { SafeImage } from "@/components/commons/SafeImage";
import type { SiteCompanyInfo } from "@/features/siteBuilder/types";

type PublicSiteIdentityProps = {
	company: SiteCompanyInfo;
	logoUrl: string;
	/** 발행된 페이지 아래에 놓일 때는 보조 정보임이 드러나야 한다. */
	withHeading?: boolean;
};

export function PublicSiteIdentity({
	company,
	logoUrl,
	withHeading = false,
}: PublicSiteIdentityProps): React.JSX.Element {
	const rows = [
		{ label: "대표자", value: company.representative },
		{ label: "업태", value: company.businessType },
		{ label: "종목", value: company.businessItem },
		{ label: "사업자등록번호", value: company.businessNumber },
		{ label: "소재지", value: company.address },
	].filter((row) => row.value);

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			{withHeading && (
				<h2 className="mb-4 text-base font-semibold text-[#0f172a]">사업자 정보</h2>
			)}

			<div className="flex items-center gap-4">
				{logoUrl ? (
					<SafeImage
						src={logoUrl}
						alt={company.companyName}
						width={64}
						height={64}
						className="size-16 shrink-0 rounded-2xl object-cover"
					/>
				) : (
					<span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-imsg-surface">
						<Building2 size={26} className="text-imsg-secondary" />
					</span>
				)}

				<div className="min-w-0">
					<h1 className="text-xl font-bold tracking-tight text-[#0f172a]">
						{company.companyName}
					</h1>
					<p className="mt-0.5 text-sm text-imsg-secondary">
						{[company.businessType, company.businessItem].filter(Boolean).join(" · ") ||
							"업종 미등록"}
					</p>
				</div>
			</div>

			{rows.length > 0 && (
				<dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 border-t border-[#F2F2F7] pt-5 sm:grid-cols-2">
					{rows.map((row) => (
						<div key={row.label} className="flex items-start gap-3">
							<dt className="w-24 shrink-0 text-sm text-imsg-secondary">{row.label}</dt>
							<dd className="min-w-0 flex-1 text-sm font-medium text-[#374151]">{row.value}</dd>
						</div>
					))}
				</dl>
			)}
		</section>
	);
}
