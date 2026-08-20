"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";
import { getCategoryLabels, CATEGORY_OPTIONS } from "@/features/buyer/constants";
import { draftListingWithAi, ListingDraftError } from "@/features/buyer/mutations";
import { AiDraftModalPreview } from "@/features/buyer/components/PostListingForm/postListing/AiDraftModalPreview";
import type { ListingCategory, ListingDraft } from "@/features/buyer/types";

const PROMPT_MAX_LENGTH = 500;

type AiDraftModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onDraftReady: (draft: ListingDraft) => void;
};

export default function AiDraftModal({ isOpen, onClose, onDraftReady }: AiDraftModalProps): React.ReactNode {
	const t = useTranslations("AiDraftModal");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));

	const [prompt, setPrompt] = useState("");
	const [categoryHint, setCategoryHint] = useState<ListingCategory | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [draft, setDraft] = useState<ListingDraft | null>(null);
	const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);

	function resetState(): void {
		setPrompt("");
		setCategoryHint(null);
		setError(null);
		setDraft(null);
		setClarificationQuestion(null);
	}

	function handleClose(): void {
		if (isLoading) return;
		resetState();
		onClose();
	}

	async function handleGenerate(): Promise<void> {
		if (!prompt.trim() || isLoading) return;

		setIsLoading(true);
		setError(null);
		setDraft(null);
		setClarificationQuestion(null);
		try {
			const result = await draftListingWithAi(prompt.trim(), categoryHint);
			if (result.needsClarification) {
				setClarificationQuestion(result.question);
			} else {
				setDraft(result);
			}
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

	function handleApply(): void {
		if (!draft) return;
		onDraftReady(draft);
		resetState();
		onClose();
	}

	function handleToggleCategoryHint(category: ListingCategory): void {
		setCategoryHint((prev) => (prev === category ? null : category));
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
						<DialogPanel className="w-full max-w-4xl">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={{ duration: 0.18, ease: "easeOut" }}
								className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
							>
								<div className="flex items-center gap-1.5 border-b border-[#E5E7EB] px-6 py-4">
									<Sparkles size={18} className="text-imsg-blue" />
									<DialogTitle className="text-base font-semibold text-[#1F2937]">
										{t("title")}
									</DialogTitle>
								</div>

								<div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
									{/* 좌측: 입력 영역 */}
									<div className="flex-1 space-y-4 overflow-y-auto border-b border-[#E5E7EB] p-5 md:border-b-0 md:border-r">
										<p className="text-sm leading-relaxed text-[#6B7280]">{t("description")}</p>

										<div className="space-y-1.5">
											<label className="text-sm font-medium text-[#374151]">
												{t("instructionLabel")}
											</label>
											<textarea
												value={prompt}
												onChange={(e) => setPrompt(e.target.value.slice(0, PROMPT_MAX_LENGTH))}
												placeholder={t("placeholder")}
												rows={5}
												disabled={isLoading}
												className="w-full resize-none rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
											/>
										</div>

										<div className="space-y-1.5">
											<label className="text-sm font-medium text-[#374151]">
												{t("categoryHintLabel")}
											</label>
											<div className="flex flex-wrap gap-1.5">
												{CATEGORY_OPTIONS.map((category) => (
													<button
														key={category}
														type="button"
														onClick={() => handleToggleCategoryHint(category)}
														disabled={isLoading}
														className={cn(
															"rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
															categoryHint === category
																? "border-imsg-blue bg-imsg-blue text-white"
																: "border-[#E2E8F0] bg-white text-[#374151] hover:bg-[#F9FAFB]",
														)}
													>
														{categoryLabels[category]}
													</button>
												))}
											</div>
										</div>

										{error && <p className="text-sm text-red-500">{error}</p>}
									</div>

									{/* 우측: 결과 미리보기 */}
									<div className="min-h-[220px] flex-1 bg-[#F9FAFB] md:min-h-0">
										<AiDraftModalPreview draft={draft} clarificationQuestion={clarificationQuestion} />
									</div>
								</div>

								<div className="flex gap-2 border-t border-[#E5E7EB] px-6 py-4">
									<button
										onClick={handleClose}
										disabled={isLoading}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
									>
										{t("cancel")}
									</button>
									<button
										onClick={handleGenerate}
										disabled={isLoading || !prompt.trim()}
										className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isLoading && <Loader2 size={14} className="animate-spin" />}
										{isLoading
											? t("loading")
											: draft || clarificationQuestion
												? t("regenerate")
												: t("submit")}
									</button>
									<button
										onClick={handleApply}
										disabled={!draft || isLoading}
										className="flex-1 rounded-lg bg-[#16A34A] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-40"
									>
										{t("apply")}
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
