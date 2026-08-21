// features/verification/components/AdminVerificationQueue/AdminVerificationRejectModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";

type AdminVerificationRejectModalProps = {
	isOpen: boolean;
	isLoading: boolean;
	onConfirm: (note: string) => void;
	onClose: () => void;
};

export function AdminVerificationRejectModal({
	isOpen,
	isLoading,
	onConfirm,
	onClose,
}: AdminVerificationRejectModalProps): React.ReactNode {
	const t = useTranslations("AdminVerificationQueue");
	const [note, setNote] = useState("");

	useEffect(() => {
		if (!isOpen) setNote("");
	}, [isOpen]);

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
						<DialogPanel className="w-full max-w-sm">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={{ duration: 0.18, ease: "easeOut" }}
								className="rounded-2xl bg-white p-6 shadow-xl">
								<DialogTitle className="text-base font-semibold text-[#1F2937]">
									{t("rejectModalTitle")}
								</DialogTitle>

								<textarea
									value={note}
									onChange={(e) => setNote(e.target.value)}
									placeholder={t("rejectReasonPlaceholder")}
									rows={3}
									className="mt-3 w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
								/>

								<div className="mt-6 flex gap-2">
									<button
										onClick={onClose}
										disabled={isLoading}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50">
										{t("rejectCancel")}
									</button>
									<button
										onClick={() => onConfirm(note.trim())}
										disabled={isLoading || !note.trim()}
										className="flex-1 rounded-lg bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60">
										{isLoading ? t("processing") : t("rejectConfirm")}
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
