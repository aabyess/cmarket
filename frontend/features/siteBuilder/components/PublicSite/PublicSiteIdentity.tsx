import { Building2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SafeImage } from "@/components/commons/SafeImage";
import { VerificationBadge } from "@/features/verification/components/VerificationBadge";
import type { SiteCompanyInfo } from "@/features/siteBuilder/types";
import type { VerificationStatus } from "@/features/verification/types";

type PublicSiteIdentityProps = {
	company: SiteCompanyInfo;
	verificationStatus: VerificationStatus;
	logoUrl: string;
	/** 발행된 페이지 아래에 놓일 때는 보조 정보임이 드러나야 한다. */
	withHeading?: boolean;
};

export async function PublicSiteIdentity({
	company,
	verificationStatus,
	logoUrl,
	withHeading = false,
}: PublicSiteIdentityProps): Promise<React.JSX.Element> {
	const t = await getTranslations("PublicSiteIdentity");
	const rows = [
		{ label: t("representativeLabel"), value: company.representative },
		{ label: t("businessTypeLabel"), value: company.businessType },
		{ label: t("businessItemLabel"), value: company.businessItem },
		{ label: t("businessNumberLabel"), value: company.businessNumber },
		{ label: t("addressLabel"), value: company.address },
	].filter((row) => row.value);

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			{withHeading && (
				<h2 className="mb-4 text-base font-semibold text-[#0f172a]">{t("heading")}</h2>
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
					<div className="flex flex-wrap items-center gap-2">
						<h1 className="text-xl font-bold tracking-tight text-[#0f172a]">
							{company.companyName}
						</h1>
						<VerificationBadge status={verificationStatus} />
					</div>
					<p className="mt-0.5 text-sm text-imsg-secondary">
						{[company.businessType, company.businessItem].filter(Boolean).join(" · ") ||
							t("businessTypeUnknown")}
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
