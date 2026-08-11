"use client";

import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import ListingDescriptionEditor from "@/features/buyer/components/PostListingForm/postListing/ListingDescriptionEditor";
import type { ListingFormData } from "@/features/buyer/types";

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