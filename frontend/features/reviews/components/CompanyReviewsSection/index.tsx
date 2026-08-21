"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import type { CompanyReview } from "@/features/reviews/serverApis";

const VISIBLE_STEP = 10;

type CompanyReviewsSectionProps = {
	reviews: CompanyReview[];
	totalCount: number;
	averageRating: number | null;
};

export function CompanyReviewsSection({
	reviews,
	totalCount,
	averageRating,
}: CompanyReviewsSectionProps): React.ReactNode {
	const t = useTranslations("CompanyReviewsSection");
	const locale = useLocale();
	const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);

	if (totalCount === 0) return null;

	const visibleReviews = reviews.slice(0, visibleCount);

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			<div className="mb-4 flex items-center gap-2">
				<h2 className="text-base font-semibold text-[#0f172a]">{t("title", { count: totalCount })}</h2>
				<RatingSummary average={averageRating} count={totalCount} />
			</div>

			<ul className="space-y-4">
				{visibleReviews.map((review) => (
					<li key={review.id} className="border-t border-[#F2F2F7] pt-4 first:border-t-0 first:pt-0">
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-medium text-[#1F2937]">
								{review.reviewerCompanyName || t("anonymousCompany")}
							</p>
							<span className="shrink-0 text-xs text-imsg-secondary">
								{new Date(review.createdAt).toLocaleDateString(locale)}
							</span>
						</div>
						<div className="mt-1 flex items-center gap-0.5">
							{[1, 2, 3, 4, 5].map((value) => (
								<Star
									key={value}
									size={13}
									className={value <= review.rating ? "fill-amber-500 text-amber-500" : "fill-transparent text-[#D1D5DB]"}
								/>
							))}
						</div>
						{review.comment && (
							<p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
								{review.comment}
							</p>
						)}
					</li>
				))}
			</ul>

			{visibleCount < reviews.length && (
				<button
					type="button"
					onClick={() => setVisibleCount((prev) => prev + VISIBLE_STEP)}
					className="mt-4 w-full rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-imsg-surface">
					{t("showMoreButton")}
				</button>
			)}
		</section>
	);
}
