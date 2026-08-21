// features/buyer/components/OrderListBookmarkersModal/index.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Building2, Loader2, Star } from "lucide-react";
import { SafeImage } from "@/components/commons/SafeImage";
import { VerificationBadge } from "@/features/verification/components/VerificationBadge";
import { getModalPanelTransition } from "@/utils/modalMotion";
import type { ListingBookmarker } from "@/features/buyer/types";

async function fetchBookmarkers(listingId: string): Promise<ListingBookmarker[]> {
	const res = await fetch(`/api/buyer/listing-bookmarks?listingId=${listingId}`);
	if (!res.ok) return [];
	const data = await res.json();
	return data.bookmarkers ?? [];
}

type OrderListBookmarkersModalProps = {
	listingId: string | null;
	onClose: () => void;
};

export function OrderListBookmarkersModal({
	listingId,
	onClose,
}: OrderListBookmarkersModalProps): React.ReactNode {
	const t = useTranslations("OrderListBookmarkersModal");
	const locale = useLocale();
	const prefersReducedMotion = useReducedMotion();
	const [bookmarkers, setBookmarkers] = useState<ListingBookmarker[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!listingId) return;
		let cancelled = false;
		setIsLoading(true);
		fetchBookmarkers(listingId).then((result) => {
			if (!cancelled) {
				setBookmarkers(result);
				setIsLoading(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [listingId]);

	const isOpen = listingId !== null;

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
								className="max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl">
								<div className="border-b border-[#F3F4F6] px-6 py-4">
									<DialogTitle className="flex items-center gap-1.5 text-base font-semibold text-[#1F2937]">
										<Star size={16} className="text-amber-400" fill="currentColor" />
										{t("title")}
									</DialogTitle>
								</div>

								<div className="max-h-[60vh] overflow-y-auto p-2">
									{isLoading ? (
										<div className="flex items-center justify-center py-10">
											<Loader2 size={20} className="animate-spin text-[#9CA3AF]" />
										</div>
									) : (
										bookmarkers.map((bookmarker) => (
											<Link
												key={bookmarker.profileId}
												href={`/companies/${bookmarker.profileId}`}
												onClick={onClose}
												className="hover:bg-imsg-surface flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors">
												{bookmarker.logoUrl ? (
													<SafeImage
														src={bookmarker.logoUrl}
														alt={bookmarker.companyName}
														width={40}
														height={40}
														className="size-10 shrink-0 rounded-xl object-cover"
													/>
												) : (
													<span className="bg-imsg-surface flex size-10 shrink-0 items-center justify-center rounded-xl">
														<Building2 size={16} className="text-imsg-secondary" />
													</span>
												)}
												<span className="min-w-0 flex-1">
													<span className="flex items-center gap-1.5">
														<span className="block truncate text-sm font-medium text-[#0f172a]">
															{bookmarker.companyName}
														</span>
														<VerificationBadge status={bookmarker.verificationStatus} />
													</span>
													<span className="text-imsg-secondary mt-0.5 block text-xs">
														{t("bookmarkedOn", {
															date: new Date(bookmarker.bookmarkedAt).toLocaleDateString(locale),
														})}
													</span>
												</span>
											</Link>
										))
									)}
								</div>
							</motion.div>
						</DialogPanel>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}
