"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Building2, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { startChat } from "@/features/chat/mutations";
import type { Currency, ReceivedQuote } from "@/features/buyer/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const ROW_LABELS = [
	{ key: "price", label: "견적가" },
	{ key: "delivery", label: "납품 소요" },
	{ key: "businessType", label: "업태 / 종목" },
	{ key: "representative", label: "대표자" },
	{ key: "businessNumber", label: "사업자등록번호" },
	{ key: "address", label: "소재지" },
	{ key: "note", label: "제안 메모" },
] as const;

type QuoteCompareTableProps = {
	quotes: ReceivedQuote[];
};

export function QuoteCompareTable({ quotes }: QuoteCompareTableProps) {
	const router = useRouter();
	const [startingId, setStartingId] = useState<string | null>(null);
	const [awardingId, setAwardingId] = useState<string | null>(null);

	const lowestPrice = Math.min(...quotes.map((q) => q.price));
	const fastestDays = Math.min(...quotes.map((q) => q.deliveryDays));

	async function handleStartChat(quoteId: string) {
		setStartingId(quoteId);
		try {
			await startChat(quoteId);
			router.push("/buyer/chat");
		} catch (err) {
			console.error(err);
			setStartingId(null);
		}
	}
	
	async function handleAward(quoteId: string) {
		if (!confirm("낙찰 확정하시겠습니까? 이후 취소가 어렵습니다.")) return;
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
			router.push("/buyer/chat");
		} catch (err) {
			console.error(err);
			alert("낙찰 처리 중 오류가 발생했습니다.");
		} finally {
			setAwardingId(null);
		}
	}

	function renderCell(quote: ReceivedQuote, key: (typeof ROW_LABELS)[number]["key"]) {
		const symbol = CURRENCY_SYMBOL[quote.currency];

		switch (key) {
			case "price":
				return (
					<span
						className={cn(
							"text-[17px] font-semibold",
							quote.price === lowestPrice ? "text-[#D97706]" : "text-[#1F2937]",
						)}
					>
						{symbol} {quote.price.toLocaleString()}
					</span>
				);
			case "delivery":
				return (
					<span
						className={cn(
							"text-[17px] font-semibold",
							quote.deliveryDays === fastestDays ? "text-[#16A34A]" : "text-[#1F2937]",
						)}
					>
						{quote.deliveryDays}일
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
			case "businessNumber":
				return <span className="text-[#374151]">{quote.seller.businessNumber || "-"}</span>;
			case "address":
				return <span className="text-[#374151]">{quote.seller.address || "-"}</span>;
			case "note":
				return (
					<span className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#6B7280]">
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
								항목
							</th>
							{quotes.map((quote) => (
								<th
									key={quote.id}
									className={cn(
										"min-w-[200px] border-l border-[#E5E7EB] px-4 py-4 text-left align-top",
										quote.status === "awarded" && "bg-[#ECFDF5]",
									)}
								>
									<div className="mb-1.5 flex flex-wrap gap-1">
										{quote.price === lowestPrice && (
											<span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-medium text-[#D97706]">
												최저가
											</span>
										)}
										{quote.deliveryDays === fastestDays && (
											<span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[11px] font-medium text-[#16A34A]">
												최속납기
											</span>
										)}
										{quote.status === "awarded" && (
											<span className="flex items-center gap-0.5 rounded-full bg-[#059669] px-2 py-0.5 text-[11px] font-medium text-white">
												<CheckCircle2 size={10} />
												확정
											</span>
										)}
									</div>
									<p className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1F2937]">
										<Building2 size={14} className="shrink-0 text-[#6B7280]" />
										{quote.seller.companyName || "이름 없음"}
									</p>
								</th>
							))}
						</tr>
					</thead>

					<tbody className="divide-y divide-[#F3F4F6]">
						{ROW_LABELS.map((row) => (
							<tr key={row.key}>
								<td className="sticky left-0 z-10 bg-white px-4 py-3.5 align-top text-xs font-medium text-[#9CA3AF]">
									{row.label}
								</td>
								{quotes.map((quote) => (
									<td
										key={quote.id}
										className={cn(
											"border-l border-[#F3F4F6] px-4 py-3.5 align-top",
											quote.status === "awarded" && "bg-[#F0FDF4]",
										)}
									>
										{renderCell(quote, row.key)}
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
											onClick={() => handleAward(quote.id)}
											disabled={awardingId === quote.id || quote.status === "awarded"}
											className={cn(
												"flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-semibold transition-colors",
												quote.status === "awarded"
													? "bg-[#059669] text-white"
													: "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] disabled:opacity-60",
											)}
										>
											<CheckCircle2 size={14} />
											{quote.status === "awarded"
												? "낙찰 확정됨"
												: awardingId === quote.id
													? "처리 중..."
													: "낙찰 확정"}
										</button>
										<button
											onClick={() => handleStartChat(quote.id)}
											disabled={startingId === quote.id}
											className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3B82F6] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
										>
											<MessageSquare size={14} />
											{startingId === quote.id ? "이동 중..." : "문의하기"}
										</button>
									</div>
								</td>
							))}
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}