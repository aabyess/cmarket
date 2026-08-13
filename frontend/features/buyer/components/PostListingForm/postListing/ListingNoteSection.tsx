"use client";

import dynamic from "next/dynamic";
import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import type { ListingFormData } from "@/features/buyer/types";

const ListingDescriptionEditor = dynamic(
	() => import("@/features/buyer/components/PostListingForm/postListing/ListingDescriptionEditor"),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-[220px] items-center justify-center rounded-lg border border-[#E2E8F0] text-sm text-imsg-secondary">
				에디터를 불러오는 중...
			</div>
		),
	},
);

type ListingNoteSectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingNoteSection({ form, onChange }: ListingNoteSectionProps) {
	return (
		<SectionWrapper
			title="전달사항"
			subtitle="공급사에게 전달할 추가 조건 및 전달 사항이 있다면 자유롭게 작성해주세요."
		>
			<ListingDescriptionEditor
				value={form.description}
				onChange={(html) => onChange({ description: html })}
			/>
		</SectionWrapper>
	);
}