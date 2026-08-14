"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import type { ListingFormData } from "@/features/buyer/types";

function ListingNoteEditorLoading(): React.ReactNode {
	const t = useTranslations("ListingNoteSection");
	return (
		<div className="flex h-[220px] items-center justify-center rounded-lg border border-[#E2E8F0] text-sm text-imsg-secondary">
			{t("editorLoading")}
		</div>
	);
}

const ListingDescriptionEditor = dynamic(
	() => import("@/features/buyer/components/PostListingForm/postListing/ListingDescriptionEditor"),
	{
		ssr: false,
		loading: ListingNoteEditorLoading,
	},
);

type ListingNoteSectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingNoteSection({ form, onChange }: ListingNoteSectionProps) {
	const t = useTranslations("ListingNoteSection");
	return (
		<SectionWrapper
			title={t("title")}
			subtitle={t("subtitle")}
		>
			<ListingDescriptionEditor
				value={form.description}
				onChange={(html) => onChange({ description: html })}
			/>
		</SectionWrapper>
	);
}