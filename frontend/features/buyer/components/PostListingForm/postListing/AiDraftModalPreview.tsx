"use client";

import { useTranslations } from "next-intl";
import { FileSearch, Sparkles } from "lucide-react";
import { getCategoryLabels } from "@/features/buyer/constants";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import type { ListingDraft } from "@/features/buyer/types";

type AiDraftModalPreviewProps = {
	draft: ListingDraft | null;
	clarificationQuestion: string | null;
};

export function AiDraftModalPreview({
	draft,
	clarificationQuestion,
}: AiDraftModalPreviewProps): React.ReactNode {
	const t = useTranslations("AiDraftModal");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));

	if (clarificationQuestion) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
				<Sparkles size={22} className="text-imsg-blue" />
				<p className="text-sm font-semibold text-[#1F2937]">{t("clarificationLabel")}</p>
				<p className="text-sm leading-relaxed text-[#6B7280]">{clarificationQuestion}</p>
			</div>
		);
	}

	if (!draft) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
				<FileSearch size={26} className="text-[#D1D5DB]" />
				<p className="text-sm text-[#9CA3AF]">{t("previewEmpty")}</p>
			</div>
		);
	}

	return (
		<div className="h-full space-y-4 overflow-y-auto p-5">
			<div>
				<p className="text-xs font-medium text-[#9CA3AF]">{t("previewTitleLabel")}</p>
				<p className="mt-1 text-sm font-semibold text-[#1F2937]">{draft.title}</p>
			</div>
			<div>
				<p className="text-xs font-medium text-[#9CA3AF]">{t("previewCategoryLabel")}</p>
				<p className="mt-1 text-sm text-[#374151]">{categoryLabels[draft.category]}</p>
			</div>
			<div>
				<p className="text-xs font-medium text-[#9CA3AF]">{t("previewDescriptionLabel")}</p>
				<div
					className="prose prose-sm mt-1 max-w-none text-[#374151]"
					dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft.description) }}
				/>
			</div>
			<div>
				<p className="text-xs font-medium text-[#9CA3AF]">{t("previewItemsLabel")}</p>
				<ul className="mt-1.5 space-y-1.5">
					{draft.items.map((item, index) => (
						<li
							key={index}
							className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#374151]"
						>
							<span className="font-medium">{item.name}</span>
							{item.spec && <span className="text-[#9CA3AF]"> · {item.spec}</span>}
							<span className="ml-1 text-[#9CA3AF]">
								{item.quantity}
								{item.unit}
							</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
