"use client";

import { useTranslations } from "next-intl";
import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import type { ListingFormData } from "@/features/buyer/types";

type ListingContactSectionProps = {
	form: ListingFormData;
};

export default function ListingContactSection({ form }: ListingContactSectionProps) {
	const t = useTranslations("ListingContactSection");
	return (
		<SectionWrapper
			title={t("title")}
			subtitle={t("subtitle")}
		>
			<div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
				<table className="w-full text-sm">
					<thead className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
						<tr>
							<th className="w-24 px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
								{t("roleColumn")}
							</th>
							<th className="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">{t("nameColumn")}</th>
							<th className="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">{t("phoneColumn")}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="px-3 py-3 text-[#374151]">{t("contactPerson")}</td>
							<td className="px-3 py-3 text-[#374151]">{form.contactName || "-"}</td>
							<td className="px-3 py-3 text-[#374151]">{form.contactPhone || "-"}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p className="mt-2 text-xs text-[#9CA3AF]">
				{t("editHint")}
			</p>
		</SectionWrapper>
	);
}