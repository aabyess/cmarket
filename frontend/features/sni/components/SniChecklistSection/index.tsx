"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { SniChecklistCard } from "@/features/sni/components/SniChecklistCard";
import type { ListingCategory } from "@/features/buyer/types";

type SniChecklistSectionProps = {
	category: ListingCategory;
};

export function SniChecklistSection({ category }: SniChecklistSectionProps): React.ReactNode {
	const t = useTranslations("SniChecklist");
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-imsg-surface">
				<span className="flex items-center gap-1.5">
					<ShieldCheck size={15} className="text-imsg-secondary" />
					{isOpen ? t("toggleHide") : t("toggleShow")}
				</span>
				{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
			</button>

			{isOpen && (
				<div className="mt-2">
					<SniChecklistCard category={category} />
				</div>
			)}
		</div>
	);
}
