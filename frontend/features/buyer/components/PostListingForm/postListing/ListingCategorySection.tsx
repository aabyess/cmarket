"use client";

import { useTranslations } from "next-intl";
import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import { cn } from "@/utils/cn";
import type { ListingFormData } from "@/features/buyer/types";
import { getCategoryLabels, CATEGORY_OPTIONS } from "@/features/buyer/constants";

type ListingCategorySectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingCategorySection({ form, onChange }: ListingCategorySectionProps) {
	const t = useTranslations("ListingCategorySection");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));
	return (
		<SectionWrapper title={t("title")} subtitle={t("subtitle")}>
			<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                {CATEGORY_OPTIONS.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => onChange({ category: cat })}
                        className={cn(
                            "rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                            form.category === cat
                                ? "border-imsg-blue bg-imsg-blue text-white"
                                : "border-[#E2E8F0] bg-white text-[#374151] hover:bg-[#F9FAFB]",
                        )}
                    >
                        {categoryLabels[cat]}
                    </button>
                ))}
            </div>
		</SectionWrapper>
	);
}