"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/utils/cn";

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
	confirmLabel = "확인",
	cancelLabel = "취소",
	isLoading = false,
	variant = "default",
	onConfirm,
	onClose,
}: ConfirmModalProps) {
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
                                className="rounded-2xl bg-white p-6 shadow-xl"
                            >
                                <DialogTitle className="text-[17px] font-semibold text-[#1F2937]">
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
                                        {cancelLabel}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex-1 rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60",
                                            variant === "danger"
                                                ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                                                : "bg-[#3B82F6] hover:bg-[#2563EB]",
                                        )}
                                    >
                                        {isLoading ? "처리 중..." : confirmLabel}
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