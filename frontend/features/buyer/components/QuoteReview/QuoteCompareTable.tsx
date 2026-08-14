"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { MessageSquare, Building2, CheckCircle2, ExternalLink } from "lucide-react";
import { SafeImage } from "@/components/commons/SafeImage";
import { cn } from "@/utils/cn";
import { startChat } from "@/features/chat/mutations";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { Currency, ReceivedQuote } from "@/features/buyer/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const ROW_KEYS = ["price", "delivery", "businessType", "representative", "address", "note"] as const;

type QuoteCompareTableProps = {
	quotes: ReceivedQuote[];
};

export function QuoteCompareTable({ quotes }: QuoteCompareTableProps) {
	const t = useTranslations("QuoteCompareTable");
	const router = useRouter();
	const [startingId, setStartingId] = useState<string | null>(null);
	const [awardingId, setAwardingId] = useState<string | null>(null);
	const [confirmQuoteId, setConfirmQuoteId] = useState<string | null>(null);

	const rowLabels: Record<(typeof ROW_KEYS)[number], string> = {
		price: t("rowLabelPrice"),
		delivery: t("rowLabelDelivery"),
		businessType: t("rowLabelBusinessType"),
		representative: t("rowLabelRepresentative"),
		address: t("rowLabelAddress"),
		note: t("rowLabelNote"),
	};

	const comparablePrices = quotes
		.map((q) => q.priceInIdr)
		.filter((p): p is number => p !== null);
	const lowestPriceInIdr = comparablePrices.length > 0 ? Math.min(...comparablePrices) : null;
	const fastestDays = Math.min(...quotes.map((q) => q.deliveryDays));
	const hasAwardedQuote = quotes.some((q) => q.status === "awarded");

	async function handleStartChat(quoteId: string) {
		setStartingId(quoteId);
		const quote = quotes.find((q) => q.id === quoteId);
		try {
			await fetch("/api/chat/generate-quote-pdf", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId }),
			});
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
		}
	}

	async function handleAward(quoteId: string) {
		setAwardingId(quoteId);
		try {
			const res = await fetch("/api/buyer/award", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ quoteId }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			const { invoiceWarning } = await res.json();
			if (invoiceWarning) {
				alert(invoiceWarning);
			}
			router.push(`/buyer/chat?quoteId=${quoteId}`);
		} catch (err) {
			console.error(err);
			alert(t("awardErrorMessage"));
		} finally {
			setAwardingId(null);
			setConfirmQuoteId(null);
		}
	}

	function renderCell(quote: ReceivedQuote, key: (typeof ROW_KEYS)[number]) {
		const symbol = CURRENCY_SYMBOL[quote.currency];
		const isLowest = lowestPriceInIdr !== null && quote.priceInIdr === lowestPriceInIdr;

		switch (key) {
			case "price":
				return (
					<div>
						<span
							className={cn(
								"text-base font-semibold",
								isLowest ? "text-[#D97706]" : "text-[#1F2937]",
							)}
						>
							{symbol} {quote.price.toLocaleString()}
						</span>
						{quote.currency !== "IDR" && quote.priceInIdr !== null && (
							<p className="mt-0.5 text-xs text-[#9CA3AF]">
								{t("approxPriceIdr", { amount: Math.round(quote.priceInIdr).toLocaleString() })}
							</p>
						)}
					</div>
				);
			case "delivery":
				return (
					<span
						className={cn(
							"text-base font-semibold",
							quote.deliveryDays === fastestDays ? "text-[#16A34A]" : "text-[#1F2937]",
						)}
					>
						{t("days", { count: quote.deliveryDays })}
					</span>
				);
			case "businessType":
				return (
					<span className="text-[#374151]">
						{[quote.seller.businessType, quote.seller.businessItem]
							.filter(Boolean)
							.join(" / ") || "-"}
					</span>
				);
			case "representative":
				return <span className="text-[#374151]">{quote.seller.representative || "-"}</span>;
			case "address":
				return <span className="text-[#374151]">{quote.seller.address || "-"}</span>;
			case "note":
				return (
					<span className="whitespace-pre-wrap text-xs leading-relaxed text-[#6B7280]">
						{quote.note || "-"}
					</span>
				);
		}
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
							<th className="sticky left-0 z-10 w-32 bg-[#F9FAFB] px-4 py-4 text-left text-xs font-medium text-[#9CA3AF]">
								{t("itemHeader")}
							</th>
							{quotes.map((quote) => {
								const isLowest =
									lowestPriceInIdr !== null && quote.priceInIdr === lowestPriceInIdr;
								return (
									<th
										key={quote.id}
										className={cn(
											"min-w-[220px] border-l border-[#E5E7EB] px-4 py-4 text-left align-top",
											quote.status === "awarded" && "bg-[#ECFDF5]",
										)}
									>
										<div className="mb-2 flex flex-wrap gap-1">
											{isLowest && (
												<span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#D97706]">
													{t("lowestPriceBadge")}
												</span>
											)}
											{quote.deliveryDays === fastestDays && (
												<span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-medium text-[#16A34A]">
													{t("fastestDeliveryBadge")}
												</span>
											)}
											{quote.status === "awarded" && (
												<span className="flex items-center gap-0.5 rounded-full bg-[#059669] px-2 py-0.5 text-xs font-medium text-white">
													<CheckCircle2 size={10} />
													{t("awardedBadge")}
												</span>
											)}
										</div>
										<div className="flex items-center gap-2">
											{quote.seller.logoUrl ? (
												<SafeImage
													src={quote.seller.logoUrl}
													alt={quote.seller.companyName}
													width={32}
													height={32}
													className="size-8 rounded-lg object-cover"
												/>
											) : (
												<div className="flex size-8 items-center justify-center rounded-lg bg-[#F3F4F6]">
													<Building2 size={14} className="text-[#9CA3AF]" />
												</div>
											)}
											<button
												onClick={() => router.push(`/companies/${quote.seller.profileId}`)}
												className="flex items-center gap-1 text-sm font-semibold text-[#1F2937] hover:text-[#3B82F6] hover:underline"
											>
												{quote.seller.companyName || t("noName")}
												<ExternalLink size={12} className="text-[#9CA3AF]" />
											</button>
										</div>
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F3F4F6]">
						{ROW_KEYS.map((key) => (
							<tr key={key}>
								<td className="sticky left-0 z-10 bg-white px-4 py-3.5 align-top text-xs font-medium text-[#9CA3AF]">
									{rowLabels[key]}
								</td>
								{quotes.map((quote) => (
									<td
										key={quote.id}
										className={cn(
											"border-l border-[#F3F4F6] px-4 py-3.5 align-top",
											quote.status === "awarded" && "bg-[#F0FDF4]",
										)}
									>
										{renderCell(quote, key)}
									</td>
								))}
							</tr>
						))}
						<tr className="border-t border-[#E5E7EB]">
							<td className="sticky left-0 z-10 bg-white px-4 py-4" />
							{quotes.map((quote) => (
								<td
									key={quote.id}
									className={cn(
										"border-l border-[#F3F4F6] px-4 py-4",
										quote.status === "awarded" && "bg-[#F0FDF4]",
									)}
								>
									<div className="flex gap-2">
										<button
											onClick={() => setConfirmQuoteId(quote.id)}
											disabled={awardingId === quote.id || hasAwardedQuote}
											className={cn(
												"flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-semibold transition-colors",
												quote.status === "awarded"
													? "border border-[#D1FAE5] bg-[#F0FDF4] text-[#059669]"
													: "border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#8B5CF6] hover:text-[#8B5CF6] disabled:opacity-60",
											)}
										>
											<CheckCircle2 size={14} />
											{quote.status === "awarded"
												? t("awardedStatus")
												: hasAwardedQuote
													? t("awardClosed")
													: awardingId === quote.id
														? t("processing")
														: t("awardAction")}
										</button>
										<button
											onClick={() => handleStartChat(quote.id)}
											disabled={startingId === quote.id}
											className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3B82F6] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
										>
											<MessageSquare size={14} />
											{startingId === quote.id ? t("navigating") : t("startChat")}
										</button>
									</div>
								</td>
							))}
						</tr>
					</tbody>
				</table>
			</div>
			<ConfirmModal
				isOpen={confirmQuoteId !== null}
				title={t("modalTitle")}
				description={t("modalDescription")}
				confirmLabel={t("modalConfirmLabel")}
				variant="danger"
				isLoading={awardingId === confirmQuoteId}
				onConfirm={() => confirmQuoteId && handleAward(confirmQuoteId)}
				onClose={() => setConfirmQuoteId(null)}
			/>
		</div>
	);
}
