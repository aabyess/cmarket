"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

const COMMENT_MAX_LENGTH = 500;

type ReviewModalProps = {
	isOpen: boolean;
	isLoading?: boolean;
	onSubmit: (rating: number, comment: string) => void;
	onClose: () => void;
};

export function ReviewModal({ isOpen, isLoading = false, onSubmit, onClose }: ReviewModalProps): React.ReactNode {
	const t = useTranslations("ReviewModal");
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");

	// 제출 성공 시 부모가 reviewContractId를 null로 바꿔 Dialog만 닫힐 뿐, 이 컴포넌트의
	// state는 그대로 남는다 — 다음 거래를 평가하려 열 때 이전 별점·코멘트가 남아있지 않도록
	// isOpen이 true로 바뀔 때마다 초기화한다.
	useEffect(() => {
		if (isOpen) {
			setRating(0);
			setHoverRating(0);
			setComment("");
		}
	}, [isOpen]);

	function handleSubmit(): void {
		if (rating === 0) return;
		onSubmit(rating, comment.trim());
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
						<DialogPanel className="w-full max-w-sm">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={{ duration: 0.18, ease: "easeOut" }}
								className="rounded-2xl bg-white p-6 shadow-xl">
								<DialogTitle className="text-base font-semibold text-[#1F2937]">{t("title")}</DialogTitle>
								<p className="mt-1 text-sm text-[#6B7280]">{t("description")}</p>

								<div className="mt-4 flex items-center justify-center gap-1">
									{[1, 2, 3, 4, 5].map((value) => (
										<button
											key={value}
											type="button"
											onClick={() => setRating(value)}
											onMouseEnter={() => setHoverRating(value)}
											onMouseLeave={() => setHoverRating(0)}
											className="p-1"
											aria-label={t("starAria", { value })}>
											<Star
												size={28}
												className={cn(
													"transition-colors",
													value <= (hoverRating || rating)
														? "fill-amber-400 text-amber-400"
														: "fill-transparent text-[#D1D5DB]",
												)}
											/>
										</button>
									))}
								</div>

								<textarea
									value={comment}
									onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX_LENGTH))}
									placeholder={t("commentPlaceholder")}
									rows={3}
									maxLength={COMMENT_MAX_LENGTH}
									className="mt-4 w-full resize-none rounded-xl border border-[#E5E7EB] bg-imsg-surface p-3 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
								/>
								<p className="mt-1 text-right text-xs text-[#9CA3AF]">
									{comment.length}/{COMMENT_MAX_LENGTH}
								</p>

								<div className="mt-4 flex gap-2">
									<button
										onClick={onClose}
										disabled={isLoading}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50">
										{t("cancel")}
									</button>
									<button
										onClick={handleSubmit}
										disabled={isLoading || rating === 0}
										className="flex-1 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
										{isLoading ? t("submitting") : t("submit")}
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
