"use client";

import { cva } from "class-variance-authority";
import { Eye, Loader2, Save, Send } from "lucide-react";

export type SiteBuilderPublishState = "NEVER_PUBLISHED" | "UNPUBLISHED_CHANGES" | "SYNCED";

type SiteBuilderToolbarProps = {
	publishState: SiteBuilderPublishState;
	isPreview: boolean;
	isSaving: boolean;
	isPublishing: boolean;
	onTogglePreview: () => void;
	onSave: () => void;
	onPublish: () => void;
};

const badge = cva("rounded-full px-2.5 py-1 text-xs font-medium", {
	variants: {
		state: {
			NEVER_PUBLISHED: "bg-[#F3F4F6] text-[#6B7280]",
			UNPUBLISHED_CHANGES: "bg-[#FFFBEB] text-[#B45309]",
			SYNCED: "bg-[#F0FDF4] text-[#16A34A]",
		},
	},
	defaultVariants: { state: "NEVER_PUBLISHED" },
});

const BADGE_LABELS: Record<SiteBuilderPublishState, string> = {
	NEVER_PUBLISHED: "미발행",
	UNPUBLISHED_CHANGES: "발행 안 된 변경사항 있음",
	SYNCED: "발행됨",
};

const GHOST_BUTTON_CLASS =
	"flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] px-3.5 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-60";

export function SiteBuilderToolbar({
	publishState,
	isPreview,
	isSaving,
	isPublishing,
	onTogglePreview,
	onSave,
	onPublish,
}: SiteBuilderToolbarProps): React.JSX.Element {
	return (
		<div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
			<span className={badge({ state: publishState })}>{BADGE_LABELS[publishState]}</span>

			<div className="ml-auto flex items-center gap-2">
				<button type="button" onClick={onTogglePreview} className={GHOST_BUTTON_CLASS}>
					<Eye size={14} />
					{isPreview ? "편집으로" : "미리보기"}
				</button>

				<button
					type="button"
					onClick={onSave}
					disabled={isSaving}
					className={GHOST_BUTTON_CLASS}>
					{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
					초안 저장
				</button>

				<button
					type="button"
					onClick={onPublish}
					disabled={isPublishing}
					className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
					{isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
					발행하기
				</button>
			</div>
		</div>
	);
}
