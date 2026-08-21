"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import { getModalPanelTransition } from "@/utils/modalMotion";

type ConfirmModalProps = {
	isOpen: boolean;
	title: string;
	description?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	isLoading?: boolean;
	variant?: "default" | "danger";
	onConfirm: () => void;
	onClose: () => void;
};

export function ConfirmModal({
	isOpen,
	title,
	description,
	confirmLabel,
	cancelLabel,
	isLoading = false,
	variant = "default",
	onConfirm,
	onClose,
}: ConfirmModalProps) {
	const t = useTranslations("ConfirmModal");
	const prefersReducedMotion = useReducedMotion();
	const resolvedConfirmLabel = confirmLabel ?? t("confirm");
	const resolvedCancelLabel = cancelLabel ?? t("cancel");

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
                                className="rounded-2xl bg-white p-6 shadow-xl"
                            >
                                <DialogTitle className="text-base font-semibold text-[#1F2937]">
                                    {title}
                                </DialogTitle>

                                {description && (
                                    <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{description}</p>
                                )}

                                <div className="mt-6 flex gap-2">
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {resolvedCancelLabel}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex-1 rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60",
                                            variant === "danger"
                                                ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                                                : "bg-imsg-blue hover:bg-[#2563EB]",
                                        )}
                                    >
                                        {isLoading ? t("processing") : resolvedConfirmLabel}
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