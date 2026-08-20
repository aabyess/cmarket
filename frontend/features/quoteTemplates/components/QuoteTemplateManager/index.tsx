"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useQuoteTemplates } from "@/features/quoteTemplates/queries";
import {
	useCreateQuoteTemplate,
	useUpdateQuoteTemplate,
	useDeleteQuoteTemplate,
} from "@/features/quoteTemplates/mutations";
import { QuoteTemplateManagerForm } from "@/features/quoteTemplates/components/QuoteTemplateManager/QuoteTemplateManagerForm";
import { QuoteTemplateManagerRow } from "@/features/quoteTemplates/components/QuoteTemplateManager/QuoteTemplateManagerRow";
import type { QuoteTemplate, QuoteTemplateInput } from "@/features/quoteTemplates/types";

export function QuoteTemplateManager(): React.ReactNode {
	const t = useTranslations("QuoteTemplateManager");
	const { data: templates = [], isLoading } = useQuoteTemplates();
	const { mutateAsync: createTemplate, isPending: isCreating } = useCreateQuoteTemplate();
	const { mutateAsync: updateTemplate, isPending: isUpdating } = useUpdateQuoteTemplate();
	const { mutateAsync: deleteTemplate, isPending: isDeleting } = useDeleteQuoteTemplate();

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	function handleOpenCreate(): void {
		setEditingTemplate(null);
		setError(null);
		setIsFormOpen(true);
	}

	function handleOpenEdit(template: QuoteTemplate): void {
		setEditingTemplate(template);
		setError(null);
		setIsFormOpen(true);
	}

	function handleCloseForm(): void {
		setIsFormOpen(false);
		setEditingTemplate(null);
	}

	async function handleSubmit(input: QuoteTemplateInput): Promise<void> {
		setError(null);
		try {
			if (editingTemplate) {
				await updateTemplate({ id: editingTemplate.id, input });
			} else {
				await createTemplate(input);
			}
			handleCloseForm();
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
			<div className="mb-4 flex items-center justify-between">
				<p className="text-sm text-[#6B7280]">{t("description")}</p>
				<button
					onClick={handleOpenCreate}
					className="flex items-center gap-1.5 rounded-lg bg-imsg-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
				>
					<Plus size={16} />
					{t("newTemplateButton")}
				</button>
			</div>

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
						<QuoteTemplateManagerRow
							key={template.id}
							template={template}
							onEdit={() => handleOpenEdit(template)}
							onDelete={() => setDeletingId(template.id)}
						/>
					))}
				</div>
			)}

			<QuoteTemplateManagerForm
				isOpen={isFormOpen}
				template={editingTemplate}
				isSaving={isCreating || isUpdating}
				onClose={handleCloseForm}
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
