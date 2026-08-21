// features/buyer/components/QuoteReview/QuoteReviewRecommendedCard.tsx
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Building2, ExternalLink, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { SafeImage } from "@/components/commons/SafeImage";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import type { QuoteRecommendation } from "@/features/buyer/components/QuoteReview/quoteReviewUtils";

type QuoteReviewRecommendedCardProps = {
	recommendation: QuoteRecommendation;
	backHref: string;
	isStartingChat: boolean;
	onStartChat: (quoteId: string) => void;
};

export function QuoteReviewRecommendedCard({
	recommendation,
	backHref,
	isStartingChat,
	onStartChat,
}: QuoteReviewRecommendedCardProps): React.JSX.Element {
	const t = useTranslations("QuoteReviewRecommendedCard");
	const { quote, priceRank, deliveryRank, totalCount } = recommendation;
	const symbol = CURRENCY_SYMBOL[quote.currency];

	return (
		<div className="mt-4 rounded-2xl border-2 border-imsg-blue bg-[#F5F9FF] p-5 shadow-sm">
			<p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-imsg-blue">
				<Sparkles size={15} />
				{t("title")}
			</p>

			<Link
				href={`/companies/${quote.seller.profileId}?from=${encodeURIComponent(backHref)}`}
				className="group mb-3 flex items-center gap-3 rounded-xl px-1 py-1 transition-colors duration-200 hover:bg-white/60">
				{quote.seller.logoUrl ? (
					<SafeImage
						src={quote.seller.logoUrl}
						alt={quote.seller.companyName}
						width={40}
						height={40}
						className="size-10 shrink-0 rounded-xl object-cover"
					/>
				) : (
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white">
						<Building2 size={16} className="text-imsg-secondary" />
					</span>
				)}
				<span className="flex min-w-0 flex-1 items-center gap-1.5 text-base font-semibold text-[#0f172a]">
					<span className="truncate">{quote.seller.companyName}</span>
					<ExternalLink size={11} className="shrink-0 text-[#9CA3AF]" />
					{quote.seller.ratingCount > 0 && (
						<RatingSummary
							average={quote.seller.ratingAverage}
							count={quote.seller.ratingCount}
							className="shrink-0 text-xs font-normal"
						/>
					)}
				</span>
			</Link>

			<div className="mb-3 flex flex-wrap items-end gap-x-8 gap-y-2">
				<div>
					<p className="text-xs text-imsg-secondary">{t("priceLabel")}</p>
					<p className="text-xl font-bold tracking-tight text-[#0f172a]">
						{symbol} {quote.price.toLocaleString()}
					</p>
				</div>
				<div>
					<p className="text-xs text-imsg-secondary">{t("deliveryLabel")}</p>
					<p className="text-xl font-bold tracking-tight text-[#0f172a]">
						{t("daysSuffix", { days: quote.deliveryDays })}
					</p>
				</div>
			</div>

			<p className="mb-4 text-sm text-[#374151]">
				{t("reason", { total: totalCount, priceRank, deliveryRank })}
			</p>

			<div className="flex gap-2">
				{/* 낙찰(기업 확정)은 채팅방에서만 — 여기서는 기업을 더 알아보는 동선을 제공한다. */}
				<Link
					href={`/companies/${quote.seller.profileId}?from=${encodeURIComponent(backHref)}`}
					className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-imsg-blue bg-white py-2.5 text-sm font-semibold text-imsg-blue transition-colors duration-200 hover:bg-[#EFF6FF]">
					<ExternalLink size={14} />
					{t("homepageButton")}
				</Link>
				<button
					type="button"
					onClick={() => onStartChat(quote.id)}
					disabled={isStartingChat}
					className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-imsg-blue py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600 disabled:opacity-60">
					{isStartingChat ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
					{t("chatButton")}
				</button>
			</div>
		</div>
	);
}
