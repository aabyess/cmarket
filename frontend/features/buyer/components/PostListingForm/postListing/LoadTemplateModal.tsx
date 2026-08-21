"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Bookmark, Loader2, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getListingTemplates } from "@/features/listingTemplates/apis";
import { getModalPanelTransition } from "@/utils/modalMotion";
import type { ListingTemplate } from "@/features/listingTemplates/types";

type LoadTemplateModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (template: ListingTemplate) => void;
};

// description은 에디터가 만든 HTML이라 미리보기에는 태그를 벗겨 평문만 보여준다.
// DOMParser는 비활성 문서를 만들어 태그 제거와 엔티티 디코딩(&amp; 등)을 한 번에,
// 스크립트 실행이나 리소스 로드 없이 처리한다.
function toPlainText(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

export default function LoadTemplateModal({
	isOpen,
	onClose,
	onSelect,
}: LoadTemplateModalProps): React.ReactNode {
	const t = useTranslations("PostListingForm");
	const prefersReducedMotion = useReducedMotion();
	const [templates, setTemplates] = useState<ListingTemplate[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		setError(null);
		setTemplates(null);
		getListingTemplates()
			.then(setTemplates)
			.catch(() => setError(t("templateLoadError")));
	}, [isOpen, t]);

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
								transition={getModalPanelTransition(prefersReducedMotion)}
								className="rounded-2xl bg-white p-6 shadow-xl">
								<div className="mb-1 flex items-center justify-between gap-1.5">
									<div className="flex items-center gap-1.5">
										<Bookmark size={18} className="text-imsg-blue" />
										<DialogTitle className="text-base font-semibold text-[#1F2937]">
											{t("templateModalTitle")}
										</DialogTitle>
									</div>
									<button
										type="button"
										onClick={onClose}
										className="text-[#9CA3AF] hover:text-[#374151]">
										<X size={18} />
									</button>
								</div>
								<p className="mb-4 text-sm leading-relaxed text-[#6B7280]">
									{t("templateModalDescription")}
								</p>

								{templates === null ? (
									<div className="flex justify-center py-8">
										<Loader2 size={20} className="animate-spin text-[#9CA3AF]" />
									</div>
								) : error ? (
									<p className="py-8 text-center text-sm text-red-500">{error}</p>
								) : templates.length === 0 ? (
									<div className="py-6 text-center">
										<p className="text-sm text-[#6B7280]">{t("templateEmptyTitle")}</p>
										<Link
											href="/buyer/listing-templates"
											className="text-imsg-blue mt-2 inline-block text-sm font-medium hover:underline">
											{t("templateManageLink")}
										</Link>
									</div>
								) : (
									<>
										<ul className="max-h-72 space-y-2 overflow-y-auto">
											{templates.map((template) => (
												<li key={template.id}>
													<button
														type="button"
														onClick={() => onSelect(template)}
														className="hover:border-imsg-blue w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-left transition-colors hover:bg-[#EFF6FF]">
														<p className="text-sm font-semibold text-[#1F2937]">{template.name}</p>
														{template.title && (
															<p className="mt-0.5 truncate text-xs text-[#9CA3AF]">
																{template.title}
															</p>
														)}
														{toPlainText(template.description) !== "" && (
															<p className="mt-1 line-clamp-2 text-xs text-[#6B7280]">
																{toPlainText(template.description)}
															</p>
														)}
													</button>
												</li>
											))}
										</ul>
										<Link
											href="/buyer/listing-templates"
											className="text-imsg-blue mt-4 block text-center text-sm font-medium hover:underline">
											{t("templateManageLink")}
										</Link>
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
