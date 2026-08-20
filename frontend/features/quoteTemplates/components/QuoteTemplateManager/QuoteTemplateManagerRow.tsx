"use client";

import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import type { QuoteTemplate } from "@/features/quoteTemplates/types";

type QuoteTemplateManagerRowProps = {
	template: QuoteTemplate;
	onEdit: () => void;
	onDelete: () => void;
};

function formatDate(iso: string): string {
	const date = new Date(iso);
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export function QuoteTemplateManagerRow({
	template,
	onEdit,
	onDelete,
}: QuoteTemplateManagerRowProps): React.ReactNode {
	const t = useTranslations("QuoteTemplateManager");

	return (
		<div className="flex items-center justify-between gap-4 px-5 py-4">
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-[#1F2937]">{template.name}</p>
				<p className="mt-0.5 truncate text-xs text-[#9CA3AF]">{template.note || t("noNotePreview")}</p>
			</div>
			<div className="flex shrink-0 items-center gap-3">
				<span className="text-xs text-[#9CA3AF]">
					{t("updatedAtLabel", { date: formatDate(template.updatedAt) })}
				</span>
				<button
					onClick={onEdit}
					aria-label={t("editAria")}
					className="flex size-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
				>
					<Pencil size={15} />
				</button>
				<button
					onClick={onDelete}
					aria-label={t("deleteAria")}
					className="flex size-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
				>
					<Trash2 size={15} />
				</button>
			</div>
		</div>
	);
}
