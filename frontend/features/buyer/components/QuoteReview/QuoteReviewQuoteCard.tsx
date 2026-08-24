"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";
import { SafeImage } from "@/components/commons/SafeImage";
import {
	Building2,
	ChevronDown,
	ChevronUp,
	ExternalLink,
	FileText,
	Loader2,
	MapPin,
	MessageSquare,
	TrendingDown,
	Truck,
} from "lucide-react";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { cn } from "@/utils/cn";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import { VerificationBadge } from "@/features/verification/components/VerificationBadge";
import type { ListingItem, ReceivedQuote } from "@/features/buyer/types";

type QuoteReviewQuoteCardProps = {
	quote: ReceivedQuote;
	listingItems: ListingItem[];
	backHref: string;
	isLowestPrice: boolean;
	isFastest: boolean;
	isHighestPrice: boolean;
	isSlowestDelivery: boolean;
	isStartingChat: boolean;
	onStartChat: (quoteId: string) => void;
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
	listingItems,
	backHref,
	isLowestPrice,
	isFastest,
	isHighestPrice,
	isSlowestDelivery,
	isStartingChat,
	onStartChat,
}: QuoteReviewQuoteCardProps): React.JSX.Element {
	const t = useTranslations("QuoteReviewQuoteCard");
	const locale = useLocale();
	const symbol = CURRENCY_SYMBOL[quote.currency];
	const isAwarded = quote.status === "awarded";
	const [showItemsBreakdown, setShowItemsBreakdown] = useState(false);
	const [openingAttachmentId, setOpeningAttachmentId] = useState<string | null>(null);

	async function handleOpenAttachment(attachmentId: string, storagePath: string): Promise<void> {
		setOpeningAttachmentId(attachmentId);
		try {
			const res = await fetch(
				`/api/seller/quote-attachment-url?quoteId=${quote.id}&storagePath=${encodeURIComponent(storagePath)}`,
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			window.open(data.url, "_blank", "noopener,noreferrer");
		} catch (err) {
			console.error(err);
		} finally {
			setOpeningAttachmentId(null);
		}
	}

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

			{/* 회사 정보 전체가 홈페이지로 가는 링크. 명시적 진입은 하단 "기업 홈페이지" 버튼이 담당한다. */}
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
					<span className="flex items-center gap-1.5">
						<span className="block truncate text-base font-semibold text-[#0f172a]">
							{quote.seller.companyName}
						</span>
						<VerificationBadge status={quote.seller.verificationStatus} />
					</span>
					<span className="mt-0.5 block text-xs text-imsg-secondary">
						{t("representativePrefix", { name: quote.seller.representative || "-" })} ·{" "}
						{t("submittedOn", {
							date: new Date(quote.createdAt).toLocaleDateString(DATE_LOCALE[locale] ?? "en-US"),
						})}
						{quote.revisedAt && ` · ${t("revisedSuffix")}`}
						{quote.seller.ratingCount > 0 && (
							<>
								{" · "}
								<RatingSummary average={quote.seller.ratingAverage} count={quote.seller.ratingCount} />
							</>
						)}
					</span>
				</span>

			</Link>

			<div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-3 rounded-xl bg-[#FAFAFC] px-4 py-3.5">
				<div>
					<p className="text-xs text-imsg-secondary">{t("priceLabel")}</p>
					<motion.p
						layoutId={`quote-price-${quote.id}`}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className={cn(
							"text-2xl font-bold tracking-tight",
							isLowestPrice
								? "text-[#16A34A]"
								: isHighestPrice
									? "text-[#DC2626]"
									: "text-[#0f172a]",
						)}>
						{symbol} {quote.price.toLocaleString()}
					</motion.p>
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
							isFastest
								? "text-[#16A34A]"
								: isSlowestDelivery
									? "text-[#DC2626]"
									: "text-[#0f172a]",
						)}>
						{t("daysSuffix", { days: quote.deliveryDays })}
					</p>
				</div>
			</div>

			{quote.items.length > 0 && (
				<div className="mb-4 rounded-xl border border-[#F2F2F7] px-4 py-3">
					<button
						type="button"
						onClick={() => setShowItemsBreakdown((prev) => !prev)}
						className="flex w-full items-center justify-between text-sm font-medium text-[#374151]">
						{t("itemsBreakdownToggle")}
						{showItemsBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
					</button>
					{showItemsBreakdown && (
						<ul className="mt-2 space-y-1.5">
							{quote.items.map((entry) => {
								const item = listingItems.find((i) => i.id === entry.itemId);
								if (!item) return null;
								return (
									<li
										key={entry.itemId}
										className="flex items-center justify-between text-xs text-imsg-secondary">
										<span className="min-w-0 truncate text-[#374151]">{item.name}</span>
										<span className="shrink-0">
											{symbol} {entry.unitPrice.toLocaleString()} × {item.quantity}{item.unit}
										</span>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			)}

			<dl className="mb-4 space-y-1.5">
				{meta.map((row) => (
					<div key={row.value} className="flex items-start gap-2 text-sm text-imsg-secondary">
						<row.icon size={13} className="mt-0.5 shrink-0" />
						<span className="min-w-0 flex-1 text-[#374151]">{row.value}</span>
					</div>
				))}
			</dl>

			{quote.paymentTerms && (
				<div className="mb-4 rounded-xl border border-[#F2F2F7] px-4 py-3 text-sm">
					<p className="text-xs text-imsg-secondary">{t("paymentTermsLabel")}</p>
					<p className="mt-0.5 whitespace-pre-wrap text-[#374151]">{quote.paymentTerms}</p>
				</div>
			)}

			{quote.attachments.length > 0 && (
				<ul className="mb-4 space-y-1.5">
					{quote.attachments.map((attachment) => (
						<li
							key={attachment.id}
							className="flex items-center gap-2 rounded-xl border border-[#F2F2F7] px-4 py-2.5">
							<FileText size={14} className="shrink-0 text-imsg-secondary" />
							<span className="min-w-0 flex-1 truncate text-sm text-[#374151]">{attachment.fileName}</span>
							<button
								type="button"
								onClick={() => handleOpenAttachment(attachment.id, attachment.storagePath)}
								disabled={openingAttachmentId === attachment.id}
								className="shrink-0 text-xs font-medium text-imsg-blue transition-colors hover:underline disabled:opacity-50">
								{openingAttachmentId === attachment.id ? (
									<Loader2 size={13} className="animate-spin" />
								) : (
									t("attachmentOpenButton")
								)}
							</button>
						</li>
					))}
				</ul>
			)}

			{quote.note && (
				<p className="mb-4 whitespace-pre-wrap rounded-xl border border-[#F2F2F7] px-4 py-3 text-sm leading-relaxed text-[#4B5563]">
					{quote.note}
				</p>
			)}

			<div className="flex gap-2">
				{/* 낙찰(기업 확정)은 채팅방에서만 — 여기서는 기업을 더 알아보는 동선을 제공한다. */}
				<Link
					href={`/companies/${quote.seller.profileId}?from=${encodeURIComponent(backHref)}`}
					className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] py-2.5 text-sm font-semibold text-[#0f172a] transition-colors duration-200 hover:bg-imsg-surface">
					<ExternalLink size={14} />
					{t("companyHomepage")}
				</Link>
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
