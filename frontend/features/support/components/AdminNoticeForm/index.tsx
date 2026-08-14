"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { Notice } from "@/features/support/types";

type AdminNoticeFormProps = {
	notice: Notice | null;
};

const INPUT_CLASS =
	"w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#0f172a] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue";

export function AdminNoticeForm({ notice }: AdminNoticeFormProps): React.JSX.Element {
	const t = useTranslations("AdminNoticeForm");
	const router = useRouter();
	const [title, setTitle] = useState(notice?.title ?? "");
	const [content, setContent] = useState(notice?.content ?? "");
	const [isPinned, setIsPinned] = useState(notice?.isPinned ?? false);
	const [isSaving, setIsSaving] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	async function handleSave(publish: boolean): Promise<void> {
		setIsSaving(true);
		try {
			const res = await fetch("/api/admin/notice", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: notice?.id, title, content, isPinned, publish }),
			});

			if (!res.ok) {
				const { error } = await res.json();
				alert(error ?? t("saveError"));
				return;
			}

			router.push("/admin/notices");
			router.refresh();
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete(): Promise<void> {
		if (!notice) return;
		setIsSaving(true);
		try {
			const res = await fetch(`/api/admin/notice?id=${notice.id}`, { method: "DELETE" });
			if (!res.ok) {
				const { error } = await res.json();
				alert(error ?? t("deleteError"));
				return;
			}
			router.push("/admin/notices");
			router.refresh();
		} finally {
			setIsSaving(false);
			setConfirmDelete(false);
		}
	}

	const canSave = title.trim().length > 0 && content.trim().length > 0 && !isSaving;

	return (
		<>
			<div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
				<div>
					<label className="mb-1.5 block text-xs font-medium text-[#374151]">{t("titleLabel")}</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder={t("titlePlaceholder")}
						className={INPUT_CLASS}
					/>
				</div>

				<div>
					<label className="mb-1.5 block text-xs font-medium text-[#374151]">{t("contentLabel")}</label>
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						rows={14}
						placeholder={t("contentPlaceholder")}
						className={`${INPUT_CLASS} resize-none leading-relaxed`}
					/>
				</div>

				<label className="flex items-center gap-2 text-sm text-[#374151]">
					<input
						type="checkbox"
						checked={isPinned}
						onChange={(e) => setIsPinned(e.target.checked)}
						className="size-4 rounded border-[#D1D5DB]"
					/>
					{t("pinToTop")}
				</label>

				<div className="flex gap-2 border-t border-[#F2F2F7] pt-5">
					{notice && (
						<button
							type="button"
							onClick={() => setConfirmDelete(true)}
							className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#DC2626] transition-colors duration-200 hover:bg-[#FEF2F2]">
							<Trash2 size={14} />
							{t("delete")}
						</button>
					)}

					<button
						type="button"
						onClick={() => handleSave(false)}
						disabled={!canSave}
						className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] py-3 text-sm font-semibold text-[#374151] transition-colors duration-200 hover:bg-imsg-surface disabled:opacity-40">
						{t("saveDraft")}
					</button>

					<button
						type="button"
						onClick={() => handleSave(true)}
						disabled={!canSave}
						className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600 disabled:opacity-40">
						{isSaving && <Loader2 size={15} className="animate-spin" />}
						{t("publish")}
					</button>
				</div>
			</div>

			<ConfirmModal
				isOpen={confirmDelete}
				title={t("deleteConfirmTitle")}
				description={t("deleteConfirmDescription")}
				confirmLabel={t("delete")}
				variant="danger"
				isLoading={isSaving}
				onConfirm={handleDelete}
				onClose={() => setConfirmDelete(false)}
			/>
		</>
	);
}
