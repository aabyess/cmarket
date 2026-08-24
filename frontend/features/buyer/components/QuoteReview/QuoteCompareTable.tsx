"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { motion } from "motion/react";
import { MessageSquare, Building2, CheckCircle2, ExternalLink } from "lucide-react";
import { SafeImage } from "@/components/commons/SafeImage";
import { cn } from "@/utils/cn";
import { startChat } from "@/features/chat/mutations";
import { ChatStartLoadingModal } from "@/features/chat/components/ChatStartLoadingModal";
import { getPriceDeliveryHighlight } from "@/features/buyer/components/QuoteReview/quoteReviewUtils";
import { RatingSummary } from "@/features/reviews/components/RatingSummary";
import type { Currency, ReceivedQuote } from "@/features/buyer/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

type QuoteCompareTableProps = {
	quotes: ReceivedQuote[];
};

export function QuoteCompareTable({ quotes }: QuoteCompareTableProps) {
	const t = useTranslations("QuoteCompareTable");
	const router = useRouter();
	const [startingId, setStartingId] = useState<string | null>(null);
	const [chatStartStep, setChatStartStep] = useState<"preparing" | "navigating" | null>(null);

	const {
		lowestPriceInIdr,
		highestPriceInIdr,
		fastestDays,
		slowestDays,
		hasPriceHighlight,
		hasDeliveryHighlight,
	} = getPriceDeliveryHighlight(quotes);

	async function handleStartChat(quoteId: string) {
		setStartingId(quoteId);
		setChatStartStep("preparing");
		const quote = quotes.find((q) => q.id === quoteId);
		try {
			await fetch("/api/chat/generate-quote-pdf", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId, sendPair: true }),
			});
			setChatStartStep("navigating");
			await startChat(quoteId, {
				price: quote?.price ?? 0,
				currency: quote?.currency ?? "USD",
				deliveryDays: quote?.deliveryDays ?? 0,
				sellerCompanyName: quote?.seller.companyName ?? "",
				previousPrice: quote?.previousPrice ?? null,
				previousDeliveryDays: quote?.previousDeliveryDays ?? null,
			});
			router.push(`/buyer/chat?quoteId=${quoteId}`);
		} catch (err) {
			console.error(err);
			setStartingId(null);
		} finally {
			setChatStartStep(null);
		}
	}

	return (
		<div className="border-hairline overflow-hidden rounded-2xl border bg-white">
			{chatStartStep && <ChatStartLoadingModal step={chatStartStep} />}

			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-sm">
					<thead className="bg-[#F9FAFB]">
						<tr className="border-hairline text-subtle border-b text-xs font-medium">
							<th className="px-4 py-3">{t("columnCompany")}</th>
							<th className="whitespace-nowrap px-4 py-3 text-right">{t("columnPrice")}</th>
							<th className="whitespace-nowrap px-4 py-3 text-right">{t("columnDelivery")}</th>
							<th className="px-4 py-3">{t("columnBusinessType")}</th>
							<th className="px-4 py-3" />
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F3F4F6]">
						{quotes.map((quote) => {
							const symbol = CURRENCY_SYMBOL[quote.currency];
							const isLowest = lowestPriceInIdr !== null && quote.priceInIdr === lowestPriceInIdr;
							const isFastest = quote.deliveryDays === fastestDays;
							const isAwarded = quote.status === "awarded";
							// 배지(위 isLowest/isFastest)와 별개로, 셀 자체 색상 강조는 최저=최고일 때(견적 1건 등)
							// 의미가 없어 hasPriceHighlight/hasDeliveryHighlight로 따로 게이팅한다.
							const isHighestPrice = hasPriceHighlight && quote.priceInIdr === highestPriceInIdr;
							const isLowestPriceCell = hasPriceHighlight && isLowest;
							const isSlowestDelivery = hasDeliveryHighlight && quote.deliveryDays === slowestDays;
							const isFastestDeliveryCell = hasDeliveryHighlight && isFastest;

							return (
								<tr
									key={quote.id}
									className={cn(
										"border-l-2",
										isAwarded ? "border-l-[#16A34A]" : "border-l-transparent",
									)}
								>
									<td className="px-4 py-3.5 align-top">
										<div className="flex items-center gap-2">
											{quote.seller.logoUrl ? (
												<SafeImage
													src={quote.seller.logoUrl}
													alt={quote.seller.companyName}
													width={28}
													height={28}
													className="size-7 shrink-0 rounded-lg object-cover"
												/>
											) : (
												<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6]">
													<Building2 size={13} className="text-subtle" />
												</div>
											)}
											<div className="min-w-0">
												<button
													onClick={() => router.push(`/companies/${quote.seller.profileId}`)}
													className="flex min-w-0 items-center gap-1 truncate font-semibold text-ink hover:text-imsg-blue hover:underline"
												>
													<span className="truncate">{quote.seller.companyName || t("noName")}</span>
													<ExternalLink size={11} className="shrink-0 text-subtle" />
												</button>
												{quote.seller.representative && (
													<p className="text-subtle truncate text-xs">
														{t("representativePrefix", { name: quote.seller.representative })}
													</p>
												)}
												{quote.seller.ratingCount > 0 && (
													<p className="text-xs">
														<RatingSummary
															average={quote.seller.ratingAverage}
															count={quote.seller.ratingCount}
														/>
													</p>
												)}
											</div>
										</div>
										{(isLowest || isFastest || isAwarded) && (
											<div className="mt-1.5 flex flex-wrap gap-1">
												{isAwarded && (
													<span className="flex items-center gap-0.5 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
														<CheckCircle2 size={10} />
														{t("awardedBadge")}
													</span>
												)}
												{isLowest && (
													<span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#D97706]">
														{t("lowestPriceBadge")}
													</span>
												)}
												{isFastest && (
													<span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-imsg-blue">
														{t("fastestDeliveryBadge")}
													</span>
												)}
											</div>
										)}
									</td>
									<td className="whitespace-nowrap px-4 py-3.5 text-right align-top">
										<motion.span
											layoutId={`quote-price-${quote.id}`}
											transition={{ type: "spring", stiffness: 300, damping: 30 }}
											className={cn(
												"rounded-md px-1.5 py-0.5 font-semibold",
												isLowestPriceCell
													? "bg-[#F0FDF4] text-[#16A34A]"
													: isHighestPrice
														? "bg-[#FEF2F2] text-[#DC2626]"
														: "text-ink",
											)}
										>
											{symbol} {quote.price.toLocaleString()}
										</motion.span>
										{quote.currency !== "IDR" && quote.priceInIdr !== null && (
											<p className="mt-0.5 text-xs text-subtle">
												{t("approxPriceIdr", { amount: Math.round(quote.priceInIdr).toLocaleString() })}
											</p>
										)}
									</td>
									<td className="whitespace-nowrap px-4 py-3.5 text-right align-top">
										<span
											className={cn(
												"rounded-md px-1.5 py-0.5 font-semibold",
												isFastestDeliveryCell
													? "bg-[#F0FDF4] text-[#16A34A]"
													: isSlowestDelivery
														? "bg-[#FEF2F2] text-[#DC2626]"
														: "text-ink",
											)}
										>
											{t("days", { count: quote.deliveryDays })}
										</span>
									</td>
									<td className="max-w-[12rem] truncate px-4 py-3.5 align-top text-[#374151]">
										{[quote.seller.businessType, quote.seller.businessItem].filter(Boolean).join(" / ") || "-"}
									</td>
									<td className="whitespace-nowrap px-4 py-3.5 align-top">
										<div className="flex gap-1.5">
											{/* 낙찰(기업 확정)은 채팅방에서만 — 여기서는 기업 홈페이지 진입만 제공한다. */}
											<button
												onClick={() => router.push(`/companies/${quote.seller.profileId}`)}
												className="flex items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-hairline bg-white px-2.5 py-1.5 text-xs font-semibold text-[#374151] transition-colors hover:border-imsg-blue hover:text-imsg-blue"
											>
												<ExternalLink size={12} />
												{t("homepageAction")}
											</button>
											<button
												onClick={() => handleStartChat(quote.id)}
												disabled={startingId === quote.id}
												className="flex items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-imsg-blue px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
											>
												<MessageSquare size={12} />
												{startingId === quote.id ? t("navigating") : t("startChat")}
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
