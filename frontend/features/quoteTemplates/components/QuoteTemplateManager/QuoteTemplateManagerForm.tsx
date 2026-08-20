"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import type { QuoteTemplate, QuoteTemplateInput } from "@/features/quoteTemplates/types";

const CURRENCY_OPTIONS = ["USD", "IDR", "KRW"] as const;

const EMPTY_FORM: QuoteTemplateInput = {
	name: "",
	note: "",
	paymentTerms: "",
	deliveryDays: null,
	currency: null,
};

type QuoteTemplateManagerFormProps = {
	isOpen: boolean;
	template: QuoteTemplate | null;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (input: QuoteTemplateInput) => void;
};

export function QuoteTemplateManagerForm({
	isOpen,
	template,
	isSaving,
	onClose,
	onSubmit,
}: QuoteTemplateManagerFormProps): React.ReactNode {
	const t = useTranslations("QuoteTemplateManager");
	const [form, setForm] = useState<QuoteTemplateInput>(EMPTY_FORM);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		setError(null);
		setForm(
			template
				? {
						name: template.name,
						note: template.note,
						paymentTerms: template.paymentTerms,
						deliveryDays: template.deliveryDays,
						currency: template.currency,
					}
				: EMPTY_FORM,
		);
	}, [isOpen, template]);

	function handleSubmit(): void {
		if (!form.name.trim()) {
			setError(t("nameRequiredError"));
			return;
		}
		onSubmit(form);
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<Dialog static open={isOpen} onClose={onClose} className="relative z-50">
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
								transition={{ duration: 0.18, ease: "easeOut" }}
								className="rounded-2xl bg-white p-6 shadow-xl"
							>
								<DialogTitle className="text-base font-semibold text-[#1F2937]">
									{template ? t("editTitle") : t("createTitle")}
								</DialogTitle>

								<div className="mt-4 space-y-4">
									<div className="space-y-1.5">
										<label className="text-sm font-medium text-[#374151]">
											{t("nameLabel")} <span className="text-imsg-blue">*</span>
										</label>
										<input
											type="text"
											value={form.name}
											onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
											placeholder={t("namePlaceholder")}
											className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-sm font-medium text-[#374151]">{t("noteLabel")}</label>
										<textarea
											value={form.note}
											onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
											placeholder={t("notePlaceholder")}
											rows={3}
											className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
										/>
									</div>

									<div className="space-y-1.5">
										<label className="text-sm font-medium text-[#374151]">
											{t("paymentTermsLabel")}
										</label>
										<input
											type="text"
											value={form.paymentTerms}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, paymentTerms: e.target.value }))
											}
											placeholder={t("paymentTermsPlaceholder")}
											className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div className="space-y-1.5">
											<label className="text-sm font-medium text-[#374151]">
												{t("deliveryDaysLabel")}
											</label>
											<input
												type="number"
												min={0}
												value={form.deliveryDays ?? ""}
												onChange={(e) =>
													setForm((prev) => ({
														...prev,
														deliveryDays: e.target.value ? Number(e.target.value) : null,
													}))
												}
												placeholder={t("deliveryDaysPlaceholder")}
												className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
											/>
										</div>

										<div className="space-y-1.5">
											<label className="text-sm font-medium text-[#374151]">
												{t("currencyLabel")}
											</label>
											<select
												value={form.currency ?? ""}
												onChange={(e) =>
													setForm((prev) => ({ ...prev, currency: e.target.value || null }))
												}
												className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm text-[#1F2937] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
											>
												<option value="">{t("currencyPlaceholder")}</option>
												{CURRENCY_OPTIONS.map((currency) => (
													<option key={currency} value={currency}>
														{currency}
													</option>
												))}
											</select>
										</div>
									</div>

									{error && <p className="text-sm text-red-500">{error}</p>}
								</div>

								<div className="mt-6 flex gap-2">
									<button
										onClick={onClose}
										disabled={isSaving}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
									>
										{t("cancelButton")}
									</button>
									<button
										onClick={handleSubmit}
										disabled={isSaving}
										className="flex-1 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
									>
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
