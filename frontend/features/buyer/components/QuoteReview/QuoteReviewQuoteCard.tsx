"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cva } from "class-variance-authority";
import { SafeImage } from "@/components/commons/SafeImage";
import {
	Building2,
	CheckCircle2,
	ExternalLink,
	Loader2,
	MapPin,
	MessageSquare,
	TrendingDown,
	Truck,
} from "lucide-react";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { cn } from "@/utils/cn";
import type { ReceivedQuote } from "@/features/buyer/types";

type QuoteReviewQuoteCardProps = {
	quote: ReceivedQuote;
	backHref: string;
	isLowestPrice: boolean;
	isFastest: boolean;
	isAwardDisabled: boolean;
	isStartingChat: boolean;
	isAwarding: boolean;
	onStartChat: (quoteId: string) => void;
	onRequestAward: (quoteId: string) => void;
};

const card = cva("rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200", {
	variants: {
		awarded: {
			true: "ring-2 ring-[#16A34A]",
			false: "hover:shadow-md",
		},
	},
	defaultVariants: { awarded: false },
});

const badge = cva("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", {
	variants: {
		tone: {
			price: "bg-[#FFFBEB] text-[#D97706]",
			speed: "bg-[#F0FDF4] text-[#16A34A]",
			awarded: "bg-[#16A34A] text-white",
		},
	},
	defaultVariants: { tone: "price" },
});

const DATE_LOCALE: Record<string, string> = {
	ko: "ko-KR",
	id: "id-ID",
	en: "en-US",
};

export function QuoteReviewQuoteCard({
	quote,
	backHref,
	isLowestPrice,
	isFastest,
	isAwardDisabled,
	isStartingChat,
	isAwarding,
	onStartChat,
	onRequestAward,
}: QuoteReviewQuoteCardProps): React.JSX.Element {
	const t = useTranslations("QuoteReviewQuoteCard");
	const locale = useLocale();
	const symbol = CURRENCY_SYMBOL[quote.currency];
	const isAwarded = quote.status === "awarded";

	const meta = [
		{
			icon: Building2,
			value:
				[quote.seller.businessType, quote.seller.businessItem].filter(Boolean).join(" · ") || "-",
		},
		{ icon: MapPin, value: quote.seller.address || "-" },
	];

	return (
		<div className={card({ awarded: isAwarded })}>
			<div className="mb-3 flex flex-wrap items-center gap-1.5">
				{isAwarded && <span className={badge({ tone: "awarded" })}>{t("awardedBadge")}</span>}
				{!isAwarded && isLowestPrice && (
					<span className={badge({ tone: "price" })}>
						<TrendingDown size={11} />
						{t("lowestPriceBadge")}
					</span>
				)}
				{!isAwarded && isFastest && (
					<span className={badge({ tone: "speed" })}>
						<Truck size={11} />
						{t("fastestDeliveryBadge")}
					</span>
				)}
			</div>

			{/* 회사 정보 전체가 홈페이지로 가는 링크다. 작은 아이콘만으로는 눌러야 하는 줄 모른다. */}
			<Link
				href={`/companies/${quote.seller.profileId}?from=${encodeURIComponent(backHref)}`}
				className="group mb-4 -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-imsg-surface">
				{quote.seller.logoUrl ? (
					<SafeImage
						src={quote.seller.logoUrl}
						alt={quote.seller.companyName}
						width={44}
						height={44}
						className="size-11 shrink-0 rounded-xl object-cover"
					/>
				) : (
					<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-imsg-surface">
						<Building2 size={18} className="text-imsg-secondary" />
					</span>
				)}

				<span className="min-w-0 flex-1">
					<span className="block text-base font-semibold text-[#0f172a]">
						{quote.seller.companyName}
					</span>
					<span className="mt-0.5 block text-xs text-imsg-secondary">
						{t("representativePrefix", { name: quote.seller.representative || "-" })} ·{" "}
						{t("submittedOn", {
							date: new Date(quote.createdAt).toLocaleDateString(DATE_LOCALE[locale] ?? "en-US"),
						})}
						{quote.revisedAt && ` · ${t("revisedSuffix")}`}
					</span>
				</span>

				<span className="flex shrink-0 items-center gap-1 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#374151] transition-colors duration-200 group-hover:border-imsg-blue group-hover:bg-white group-hover:text-imsg-blue">
					<ExternalLink size={11} />
					{t("companyHomepage")}
				</span>
			</Link>

			<div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-3 rounded-xl bg-[#FAFAFC] px-4 py-3.5">
				<div>
					<p className="text-xs text-imsg-secondary">{t("priceLabel")}</p>
					<p
						className={cn(
							"text-2xl font-bold tracking-tight",
							isLowestPrice ? "text-[#D97706]" : "text-[#0f172a]",
						)}>
						{symbol} {quote.price.toLocaleString()}
					</p>
					{quote.currency !== "IDR" && quote.priceInIdr !== null && (
						<p className="text-xs text-imsg-secondary">
							{t("approxPriceIdr", { amount: Math.round(quote.priceInIdr).toLocaleString() })}
						</p>
					)}
					{quote.previousPrice !== null && quote.previousPrice !== quote.price && (
						<p className="text-xs text-imsg-secondary line-through">
							{symbol} {quote.previousPrice.toLocaleString()}
						</p>
					)}
				</div>

				<div>
					<p className="text-xs text-imsg-secondary">{t("deliveryLabel")}</p>
					<p
						className={cn(
							"text-2xl font-bold tracking-tight",
							isFastest ? "text-[#16A34A]" : "text-[#0f172a]",
						)}>
						{t("daysSuffix", { days: quote.deliveryDays })}
					</p>
				</div>
			</div>

			<dl className="mb-4 space-y-1.5">
				{meta.map((row) => (
					<div key={row.value} className="flex items-start gap-2 text-sm text-imsg-secondary">
						<row.icon size={13} className="mt-0.5 shrink-0" />
						<span className="min-w-0 flex-1 text-[#374151]">{row.value}</span>
					</div>
				))}
			</dl>

			{quote.note && (
				<p className="mb-4 whitespace-pre-wrap rounded-xl border border-[#F2F2F7] px-4 py-3 text-sm leading-relaxed text-[#4B5563]">
					{quote.note}
				</p>
			)}

			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => onRequestAward(quote.id)}
					disabled={isAwardDisabled || isAwarding}
					className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#0f172a] transition-colors duration-200 hover:bg-imsg-surface disabled:cursor-not-allowed disabled:opacity-40">
					{isAwarding ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
					{t("awardButton")}
				</button>
				<button
					type="button"
					onClick={() => onStartChat(quote.id)}
					disabled={isStartingChat}
					className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-imsg-blue py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600 disabled:opacity-60">
					{isStartingChat ? (
						<Loader2 size={14} className="animate-spin" />
					) : (
						<MessageSquare size={14} />
					)}
					{t("chatButton")}
				</button>
			</div>
		</div>
	);
}
