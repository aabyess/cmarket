"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { cva } from "class-variance-authority";
import { SNI_CHECKLIST_DATA } from "@/features/sni/data";
import type { ListingCategory } from "@/features/buyer/types";

type SniChecklistCardProps = {
	category: ListingCategory;
};

const requiredBadge = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", {
	variants: {
		level: {
			yes: "bg-[#FEF2F2] text-[#DC2626]",
			conditional: "bg-[#FFFBEB] text-[#D97706]",
			unknown: "bg-[#F3F4F6] text-[#6B7280]",
		},
	},
});

const itemTag = cva("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", {
	variants: {
		required: {
			true: "bg-[#FEF2F2] text-[#DC2626]",
			false: "bg-[#F3F4F6] text-[#6B7280]",
		},
	},
});

export function SniChecklistCard({ category }: SniChecklistCardProps): React.ReactNode {
	const t = useTranslations("SniChecklist");
	const tCategory = useTranslations(`SniChecklist.${category}`);
	const locale = useLocale();
	const entry = SNI_CHECKLIST_DATA[category];

	const representativeItems = tCategory.raw("representativeItems") as { item: string; note: string }[];
	const requiredDocuments = tCategory.raw("requiredDocuments") as string[];

	const badgeLabel = {
		yes: t("badgeYes"),
		conditional: t("badgeConditional"),
		unknown: t("badgeUnknown"),
	}[entry.sniRequired];

	return (
		<div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
			<div className="mb-3 flex items-center justify-between gap-2">
				<span className={requiredBadge({ level: entry.sniRequired })}>{badgeLabel}</span>
				<span className="text-xs text-imsg-secondary">
					{t("lastCheckedLabel", { date: new Date(entry.lastCheckedDate).toLocaleDateString(locale) })}
				</span>
			</div>

			<p className="text-sm leading-relaxed text-[#374151]">{tCategory("summary")}</p>

			{representativeItems.length > 0 && (
				<div className="mt-4">
					<p className="mb-2 text-xs font-semibold text-imsg-secondary">{t("representativeItemsLabel")}</p>
					<ul className="space-y-2">
						{representativeItems.map((row, i) => (
							<li key={row.item} className="flex items-start gap-2 rounded-xl bg-imsg-surface p-3">
								<span className={itemTag({ required: entry.itemSniRequired[i] ?? false })}>
									{entry.itemSniRequired[i] ? t("itemRequiredTag") : t("itemNotRequiredTag")}
								</span>
								<div className="min-w-0">
									<p className="text-sm font-medium text-[#1F2937]">{row.item}</p>
									<p className="mt-0.5 text-xs text-imsg-secondary">{row.note}</p>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{requiredDocuments.length > 0 && (
				<div className="mt-4">
					<p className="mb-1.5 text-xs font-semibold text-imsg-secondary">{t("requiredDocumentsLabel")}</p>
					<ul className="list-inside list-disc space-y-0.5 text-sm text-[#374151]">
						{requiredDocuments.map((doc) => (
							<li key={doc}>{doc}</li>
						))}
					</ul>
				</div>
			)}

			<div className="mt-4">
				<p className="text-xs font-semibold text-imsg-secondary">{t("estimatedDurationLabel")}</p>
				<p className="mt-0.5 text-sm text-[#374151]">{tCategory("estimatedDuration")}</p>
			</div>

			<a
				href={entry.sourceUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-imsg-blue hover:underline">
				<ExternalLink size={11} />
				{t("sourceLabel")}
			</a>

			<div className="mt-4 flex items-start gap-2 rounded-xl bg-[#FFFBEB] p-3 text-xs text-[#92400E]">
				<AlertTriangle size={14} className="mt-0.5 shrink-0" />
				<p>{t("disclaimer")}</p>
			</div>
		</div>
	);
}
