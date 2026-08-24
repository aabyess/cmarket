// features/contract/components/ContractList/ContractListCancelModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { getModalPanelTransition } from "@/utils/modalMotion";

type ContractListCancelModalProps = {
	isOpen: boolean;
	isLoading: boolean;
	onConfirm: (reason: string) => void;
	onClose: () => void;
};

export function ContractListCancelModal({
	isOpen,
	isLoading,
	onConfirm,
	onClose,
}: ContractListCancelModalProps): React.JSX.Element {
	const t = useTranslations("ContractList");
	const tModal = useTranslations("ConfirmModal");
	const prefersReducedMotion = useReducedMotion();
	const [reason, setReason] = useState("");

	useEffect(() => {
		if (isOpen) setReason("");
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
								transition={getModalPanelTransition(prefersReducedMotion)}
								className="rounded-2xl bg-white p-6 shadow-xl">
								<DialogTitle className="text-ink text-base font-semibold">
									{t("cancelModalTitle")}
								</DialogTitle>

								<p className="text-muted mt-2 text-sm leading-relaxed">
									{t("cancelModalDescription")}
								</p>

								<label className="mt-4 block text-xs font-medium text-[#374151]">
									{t("cancelReasonLabel")}
									<textarea
										value={reason}
										onChange={(e) => setReason(e.target.value)}
										rows={3}
										maxLength={500}
										placeholder={t("cancelReasonPlaceholder")}
										className="focus:border-imsg-blue border-hairline placeholder:text-subtle mt-1.5 w-full resize-none rounded-lg border px-3 py-2.5 text-sm font-normal outline-none"
									/>
								</label>

								<div className="mt-5 flex gap-2">
									<button
										onClick={onClose}
										disabled={isLoading}
										className="border-hairline flex-1 rounded-lg border py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50">
										{tModal("cancel")}
									</button>
									<button
										onClick={() => onConfirm(reason.trim())}
										disabled={isLoading}
										className="flex-1 rounded-lg bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60">
										{isLoading ? tModal("processing") : t("cancelModalConfirmLabel")}
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
