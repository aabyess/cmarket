"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useListingTemplates } from "@/features/listingTemplates/queries";
import {
	useUpdateListingTemplate,
	useDeleteListingTemplate,
} from "@/features/listingTemplates/mutations";
import { ListingTemplateManagerForm } from "@/features/listingTemplates/components/ListingTemplateManager/ListingTemplateManagerForm";
import { ListingTemplateManagerRow } from "@/features/listingTemplates/components/ListingTemplateManager/ListingTemplateManagerRow";
import type { ListingTemplate, ListingTemplateInput } from "@/features/listingTemplates/types";

export function ListingTemplateManager(): React.ReactNode {
	const t = useTranslations("ListingTemplateManager");
	const { data: templates = [], isLoading } = useListingTemplates();
	const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateListingTemplate();
	const { mutateAsync: deleteTemplate, isPending: isDeleting } = useDeleteListingTemplate();

	const [editingTemplate, setEditingTemplate] = useState<ListingTemplate | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(input: ListingTemplateInput): Promise<void> {
		if (!editingTemplate) return;
		setError(null);
		try {
			await updateTemplate({ id: editingTemplate.id, input });
			setEditingTemplate(null);
		} catch (err) {
			console.error(err);
			setError(t("saveError"));
		}
	}

	async function handleConfirmDelete(): Promise<void> {
		if (!deletingId) return;
		try {
			await deleteTemplate(deletingId);
			setDeletingId(null);
		} catch (err) {
			console.error(err);
			setError(t("deleteError"));
			setDeletingId(null);
		}
	}

	return (
		<div>
			<p className="mb-4 text-sm text-[#6B7280]">{t("description")}</p>

			{error && <p className="mb-3 text-sm text-red-500">{error}</p>}

			{isLoading ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-sm text-[#9CA3AF]">
					{t("loading")}
				</div>
			) : templates.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<p className="text-sm text-[#6B7280]">{t("emptyState")}</p>
				</div>
			) : (
				<div className="divide-y divide-[#F3F4F6] rounded-2xl border border-[#E5E7EB] bg-white">
					{templates.map((template) => (
						<ListingTemplateManagerRow
							key={template.id}
							template={template}
							onEdit={() => setEditingTemplate(template)}
							onDelete={() => setDeletingId(template.id)}
						/>
					))}
				</div>
			)}

			<ListingTemplateManagerForm
				template={editingTemplate}
				isSaving={isUpdating}
				onClose={() => setEditingTemplate(null)}
				onSubmit={handleSubmit}
			/>

			<ConfirmModal
				isOpen={deletingId !== null}
				title={t("deleteConfirmTitle")}
				description={t("deleteConfirmDescription")}
				variant="danger"
				isLoading={isDeleting}
				onConfirm={handleConfirmDelete}
				onClose={() => setDeletingId(null)}
			/>
		</div>
	);
}
