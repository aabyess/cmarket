"use client";

import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import { cn } from "@/utils/cn";
import type { ListingFormData } from "@/features/buyer/types";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/features/buyer/constants";

type ListingCategorySectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingCategorySection({ form, onChange }: ListingCategorySectionProps) {
	return (
		<SectionWrapper title="어떤 품목인가요?" subtitle="카테고리를 선택해주세요">
			<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {CATEGORY_OPTIONS.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => onChange({ category: cat })}
                        className={cn(
                            "rounded-lg border px-2.5 py-2 text-[13px] font-medium transition-colors",
                            form.category === cat
                                ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                                : "border-[#E2E8F0] bg-white text-[#374151] hover:bg-[#F9FAFB]",
                        )}
                    >
                        {CATEGORY_LABELS[cat]}
                    </button>
                ))}
            </div>
		</SectionWrapper>
	);
}