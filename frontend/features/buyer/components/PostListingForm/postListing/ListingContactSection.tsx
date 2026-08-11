"use client";

import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import type { ListingFormData } from "@/features/buyer/types";

type ListingContactSectionProps = {
	form: ListingFormData;
};

export default function ListingContactSection({ form }: ListingContactSectionProps) {
	return (
		<SectionWrapper
			title="담당자 정보"
			subtitle="계약이 체결되면 공급사에게 공개돼요."
		>
			<div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
				<table className="w-full text-sm">
					<thead className="border-b border-[#E2E8F0] bg-[#F9FAFB]">
						<tr>
							<th className="w-24 px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">
								담당 내용
							</th>
							<th className="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">이름</th>
							<th className="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]">연락처</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="px-3 py-3 text-[#374151]">담당자</td>
							<td className="px-3 py-3 text-[#374151]">{form.contactName || "-"}</td>
							<td className="px-3 py-3 text-[#374151]">{form.contactPhone || "-"}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p className="mt-2 text-xs text-[#9CA3AF]">
				회원가입 시 등록한 담당자 정보예요. 변경이 필요하면 기업 프로필에서 수정해주세요.
			</p>
		</SectionWrapper>
	);
}