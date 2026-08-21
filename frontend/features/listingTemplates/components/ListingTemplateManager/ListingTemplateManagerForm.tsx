"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { getCategoryLabels, CATEGORY_OPTIONS } from "@/features/buyer/constants";
import { getModalPanelTransition } from "@/utils/modalMotion";
import type { ListingTemplate, ListingTemplateInput } from "@/features/listingTemplates/types";

type ListingTemplateManagerFormProps = {
	template: ListingTemplate | null;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (input: ListingTemplateInput) => void;
};

export function ListingTemplateManagerForm({
	template,
	isSaving,
	onClose,
	onSubmit,
}: ListingTemplateManagerFormProps): React.ReactNode {
	const t = useTranslations("ListingTemplateManager");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));
	const prefersReducedMotion = useReducedMotion();
	const [name, setName] = useState("");
	const [category, setCategory] = useState<ListingTemplateInput["category"]>(null);
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!template) return;
		setError(null);
		setName(template.name);
		setCategory(template.category);
		setDescription(template.description);
	}, [template]);

	function handleSubmit(): void {
		if (!template) return;
		if (!name.trim()) {
			setError(t("nameRequiredError"));
			return;
		}
		onSubmit({
			name: name.trim(),
			title: template.title,
			category,
			description,
			items: template.items,
			currency: template.currency,
		});
	}

	return (
		<AnimatePresence>
			{template && (
				<Dialog static open={template !== null} onClose={onClose} className="relative z-50">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/40"
						aria-hidden="true"
					/>

					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="w-full max-w-md">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={getModalPanelTransition(prefersReducedMotion)}
								className="rounded-2xl bg-white p-6 shadow-xl">
								<DialogTitle className="text-base font-semibold text-[#1F2937]">
									{t("editTitle")}
								</DialogTitle>

								<div className="mt-4 space-y-4">
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-[#374151]">
											{t("nameLabel")} <span className="text-imsg-blue">*</span>
										</label>
										<input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder={t("namePlaceholder")}
											className="focus:border-imsg-blue focus:ring-imsg-blue w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:ring-1 focus:outline-none"
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-sm font-medium text-[#374151]">
											{t("categoryLabel")}
										</label>
										<select
											value={category ?? ""}
											onChange={(e) =>
												setCategory((e.target.value || null) as ListingTemplateInput["category"])
											}
											className="focus:border-imsg-blue focus:ring-imsg-blue w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] focus:ring-1 focus:outline-none">
											<option value="">{t("categoryPlaceholder")}</option>
											{CATEGORY_OPTIONS.map((value) => (
												<option key={value} value={value}>
													{categoryLabels[value]}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-1.5">
										<label className="text-sm font-medium text-[#374151]">
											{t("descriptionLabel")}
										</label>
										<textarea
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder={t("descriptionPlaceholder")}
											rows={3}
											className="focus:border-imsg-blue focus:ring-imsg-blue w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:ring-1 focus:outline-none"
										/>
									</div>

									<p className="text-xs text-[#9CA3AF]">
										{t("itemsEditHint", { count: template.items.length })}
									</p>

									{error && <p className="text-sm text-red-500">{error}</p>}
								</div>

								<div className="mt-6 flex gap-2">
									<button
										onClick={onClose}
										disabled={isSaving}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50">
										{t("cancelButton")}
									</button>
									<button
										onClick={handleSubmit}
										disabled={isSaving}
										className="bg-imsg-blue flex-1 rounded-lg py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60">
										{isSaving ? t("saving") : t("saveButton")}
									</button>
								</div>
							</motion.div>
						</DialogPanel>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}
