// features/seller/components/ListingDetail/ListingDetailQuoteFormSaveTemplateModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { createQuoteTemplate } from "@/features/quoteTemplates/apis";
import type { Currency } from "@/features/buyer/types";

type ListingDetailQuoteFormSaveTemplateModalProps = {
	isOpen: boolean;
	note: string;
	paymentTerms: string;
	deliveryDays: number;
	currency: Currency;
	onClose: () => void;
};

export function ListingDetailQuoteFormSaveTemplateModal({
	isOpen,
	note,
	paymentTerms,
	deliveryDays,
	currency,
	onClose,
}: ListingDetailQuoteFormSaveTemplateModalProps): React.ReactNode {
	const t = useTranslations("ListingDetailQuoteForm");
	const [name, setName] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSaved, setIsSaved] = useState(false);

	useEffect(() => {
		if (!isOpen) return;
		setName("");
		setError(null);
		setIsSaving(false);
		setIsSaved(false);
	}, [isOpen]);

	function handleClose(): void {
		if (isSaving) return;
		onClose();
	}

	async function handleSave(): Promise<void> {
		if (!name.trim()) {
			setError(t("templateSaveNameRequired"));
			return;
		}
		if (!note.trim() && !paymentTerms.trim()) {
			setError(t("templateSaveEmptyError"));
			return;
		}

		setIsSaving(true);
		setError(null);
		try {
			await createQuoteTemplate({
				name: name.trim(),
				note,
				paymentTerms,
				deliveryDays: deliveryDays > 0 ? deliveryDays : null,
				currency,
			});
			setIsSaved(true);
			setTimeout(onClose, 1200);
		} catch {
			setError(t("templateSaveError"));
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<AnimatePresence>
			{isOpen && (
				<Dialog static open={isOpen} onClose={handleClose} className="relative z-50">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/40"
						aria-hidden="true"
					/>

					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="w-full max-w-sm">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={{ duration: 0.18, ease: "easeOut" }}
								className="rounded-2xl bg-white p-6 shadow-xl">
								<div className="mb-1 flex items-center gap-1.5">
									<Save size={18} className="text-imsg-blue" />
									<DialogTitle className="text-base font-semibold text-[#1F2937]">
										{t("templateSaveModalTitle")}
									</DialogTitle>
								</div>
								<p className="mb-4 text-sm leading-relaxed text-[#6B7280]">
									{t("templateSaveModalDescription")}
								</p>

								{isSaved ? (
									<div className="flex items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#16A34A]">
										<CheckCircle2 size={15} />
										{t("templateSaveSuccess")}
									</div>
								) : (
									<>
										<input
											type="text"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder={t("templateSaveNamePlaceholder")}
											disabled={isSaving}
											className="focus:border-imsg-blue focus:ring-imsg-blue w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:ring-1 focus:outline-none"
										/>

										{error && <p className="mt-2 text-sm text-red-500">{error}</p>}

										<div className="mt-6 flex gap-2">
											<button
												type="button"
												onClick={handleClose}
												disabled={isSaving}
												className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50">
												{t("aiModalCancel")}
											</button>
											<button
												type="button"
												onClick={handleSave}
												disabled={isSaving}
												className="bg-imsg-blue flex flex-1 items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50">
												{isSaving && <Loader2 size={14} className="animate-spin" />}
												{isSaving ? t("templateSaving") : t("templateSaveConfirm")}
											</button>
										</div>
									</>
								)}
							</motion.div>
						</DialogPanel>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}
