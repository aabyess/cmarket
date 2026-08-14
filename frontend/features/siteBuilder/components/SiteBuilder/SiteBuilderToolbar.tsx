"use client";

import { useTranslations } from "next-intl";
import { cva } from "class-variance-authority";
import { Link } from "@/i18n/navigation";
import { ExternalLink, Eye, Loader2, Save, Send } from "lucide-react";

export type SiteBuilderPublishState = "NEVER_PUBLISHED" | "UNPUBLISHED_CHANGES" | "SYNCED";

type SiteBuilderToolbarProps = {
	publishState: SiteBuilderPublishState;
	/** 발행된 공개 페이지 주소. 미발행이면 null. */
	publicHref: string | null;
	isPreview: boolean;
	isSaving: boolean;
	isPublishing: boolean;
	onTogglePreview: () => void;
	onSave: () => void;
	onPublish: () => void;
};

const badge = cva("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", {
	variants: {
		state: {
			NEVER_PUBLISHED: "bg-[#F3F4F6] text-[#6B7280]",
			UNPUBLISHED_CHANGES: "bg-[#FFFBEB] text-[#B45309]",
			SYNCED: "bg-[#F0FDF4] text-[#16A34A]",
		},
	},
	defaultVariants: { state: "NEVER_PUBLISHED" },
});

const GHOST_BUTTON_CLASS =
	"flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-60";

export function SiteBuilderToolbar({
	publishState,
	publicHref,
	isPreview,
	isSaving,
	isPublishing,
	onTogglePreview,
	onSave,
	onPublish,
}: SiteBuilderToolbarProps): React.JSX.Element {
	const t = useTranslations("SiteBuilderToolbar");

	const badgeLabel =
		publishState === "NEVER_PUBLISHED"
			? t("badgeNeverPublished")
			: publishState === "UNPUBLISHED_CHANGES"
				? t("badgeUnpublishedChanges")
				: t("badgeSynced");

	return (
		<div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
			<span className={badge({ state: publishState })}>{badgeLabel}</span>

			{publicHref && (
				<Link
					href={publicHref}
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 text-xs font-medium text-imsg-blue hover:underline">
					{t("viewPublicPage")}
					<ExternalLink size={11} />
				</Link>
			)}

			<div className="ml-auto flex items-center gap-2">
				<button type="button" onClick={onTogglePreview} className={GHOST_BUTTON_CLASS}>
					<Eye size={14} />
					{isPreview ? t("editMode") : t("previewMode")}
				</button>

				<button
					type="button"
					onClick={onSave}
					disabled={isSaving}
					className={GHOST_BUTTON_CLASS}>
					{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
					{t("saveDraft")}
				</button>

				<button
					type="button"
					onClick={onPublish}
					disabled={isPublishing}
					className="flex items-center gap-1.5 rounded-lg bg-imsg-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
					{isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
					{t("publish")}
				</button>
			</div>
		</div>
	);
}
