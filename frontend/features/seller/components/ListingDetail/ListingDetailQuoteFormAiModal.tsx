// features/seller/components/ListingDetail/ListingDetailQuoteFormAiModal.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";

const INSTRUCTIONS_MAX_LENGTH = 500;

type ListingDetailQuoteFormAiModalProps = {
	isOpen: boolean;
	isLoading: boolean;
	onClose: () => void;
	onGenerate: (instructions: string) => void;
};

export function ListingDetailQuoteFormAiModal({
	isOpen,
	isLoading,
	onClose,
	onGenerate,
}: ListingDetailQuoteFormAiModalProps): React.ReactNode {
	const t = useTranslations("ListingDetailQuoteForm");
	const [instructions, setInstructions] = useState("");

	function handleClose(): void {
		if (isLoading) return;
		onClose();
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
						<DialogPanel className="w-full max-w-md">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={{ duration: 0.18, ease: "easeOut" }}
								className="rounded-2xl bg-white p-6 shadow-xl"
							>
								<div className="mb-1 flex items-center gap-1.5">
									<Sparkles size={18} className="text-imsg-blue" />
									<DialogTitle className="text-base font-semibold text-[#1F2937]">
										{t("aiModalTitle")}
									</DialogTitle>
								</div>
								<p className="mb-4 text-sm leading-relaxed text-[#6B7280]">
									{t("aiModalDescription")}
								</p>

								<textarea
									value={instructions}
									onChange={(e) => setInstructions(e.target.value.slice(0, INSTRUCTIONS_MAX_LENGTH))}
									placeholder={t("aiModalPlaceholder")}
									rows={3}
									disabled={isLoading}
									className="w-full resize-none rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
								/>

								<div className="mt-6 flex gap-2">
									<button
										type="button"
										onClick={handleClose}
										disabled={isLoading}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
									>
										{t("aiModalCancel")}
									</button>
									<button
										type="button"
										onClick={() => onGenerate(instructions.trim())}
										disabled={isLoading}
										className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isLoading && <Loader2 size={14} className="animate-spin" />}
										{isLoading ? t("aiDrafting") : t("aiModalGenerate")}
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
