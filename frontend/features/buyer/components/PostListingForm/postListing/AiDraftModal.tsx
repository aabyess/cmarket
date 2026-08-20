"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import { draftListingWithAi, ListingDraftError } from "@/features/buyer/mutations";
import type { ListingDraft } from "@/features/buyer/types";

const PROMPT_MAX_LENGTH = 500;

type AiDraftModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onDraftReady: (draft: ListingDraft) => void;
};

export default function AiDraftModal({ isOpen, onClose, onDraftReady }: AiDraftModalProps): React.ReactNode {
	const t = useTranslations("AiDraftModal");
	const [prompt, setPrompt] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	function handleClose(): void {
		if (isLoading) return;
		setPrompt("");
		setError(null);
		onClose();
	}

	async function handleSubmit(): Promise<void> {
		if (!prompt.trim() || isLoading) return;

		setIsLoading(true);
		setError(null);
		try {
			const draft = await draftListingWithAi(prompt.trim());
			setPrompt("");
			onDraftReady(draft);
			onClose();
		} catch (err) {
			if (err instanceof ListingDraftError && err.status === 503) {
				setError(t("notConfigured"));
			} else if (err instanceof ListingDraftError && err.status === 429) {
				setError(t("rateLimited"));
			} else {
				setError(t("genericError"));
			}
		} finally {
			setIsLoading(false);
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
										{t("title")}
									</DialogTitle>
								</div>
								<p className="mb-4 text-sm leading-relaxed text-[#6B7280]">{t("description")}</p>

								<textarea
									value={prompt}
									onChange={(e) => setPrompt(e.target.value.slice(0, PROMPT_MAX_LENGTH))}
									placeholder={t("placeholder")}
									rows={3}
									disabled={isLoading}
									className="w-full resize-none rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
								/>

								{error && <p className="mt-2 text-sm text-red-500">{error}</p>}

								<div className="mt-6 flex gap-2">
									<button
										onClick={handleClose}
										disabled={isLoading}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
									>
										{t("cancel")}
									</button>
									<button
										onClick={handleSubmit}
										disabled={isLoading || !prompt.trim()}
										className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isLoading && <Loader2 size={14} className="animate-spin" />}
										{isLoading ? t("loading") : t("submit")}
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
