"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { postQuote } from "@/features/seller/mutations";
import type { Currency } from "@/features/buyer/types";
import type { QuoteFormData } from "@/features/seller/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
	{ value: "USD", label: "USD", symbol: "$" },
	{ value: "IDR", label: "IDR", symbol: "Rp" },
	{ value: "KRW", label: "KRW", symbol: "₩" },
];

type ListingDetailQuoteFormProps = {
	listingId: string;
	defaultCurrency: Currency;
	hasSubmittedQuote: boolean;
};

export function ListingDetailQuoteForm({
	listingId,
	defaultCurrency,
	hasSubmittedQuote,
}: ListingDetailQuoteFormProps) {
	const router = useRouter();
	const [form, setForm] = useState<QuoteFormData>({
		price: 0,
		currency: defaultCurrency,
		deliveryDays: 0,
		note: "",
	});
	const [isLoading, setIsLoading] = useState(false);

	const currentSymbol = CURRENCIES.find((c) => c.value === form.currency)?.symbol ?? "$";

	function handleChange(patch: Partial<QuoteFormData>) {
		setForm((prev) => ({ ...prev, ...patch }));
	}

	async function handleSubmit() {
		if (form.price <= 0) {
			alert("견적 금액을 입력해주세요.");
			return;
		}
		if (form.deliveryDays <= 0) {
			alert("납품 소요일을 입력해주세요.");
			return;
		}

		setIsLoading(true);
		try {
			await postQuote(listingId, form);
			router.push("/seller/quote-submit");
		} catch (err) {
			console.error(err);
			alert("견적 제출에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	}

	if (hasSubmittedQuote) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center">
				<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#ECFDF5]">
					<CheckCircle2 size={24} className="text-[#059669]" />
				</div>
				<p className="text-[15px] font-medium text-[#1F2937]">견적을 이미 보냈어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">
					발주기관이 검토 중이에요. 결과가 나오면 알려드릴게요.
				</p>
				<button
					onClick={() => router.push("/seller/quote-submit")}
					className="mt-4 w-full rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50"
				>
					보낸 견적 보기
				</button>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border-2 border-[#3B82F6] bg-white p-5">
			<p className="text-[15px] font-semibold text-[#1F2937]">견적 보내기</p>
			<p className="mt-1 text-xs text-[#6B7280]">제출 후 수정할 수 없어요.</p>

			<div className="mt-4 space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						견적 금액 <span className="text-[#3B82F6]">*</span>
					</label>
					<div className="mb-2 flex gap-1.5">
						{CURRENCIES.map((currency) => (
							<button
								key={currency.value}
								onClick={() => handleChange({ currency: currency.value })}
								className={cn(
									"flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
									form.currency === currency.value
										? "border-[#3B82F6] bg-[#3B82F6] text-white"
										: "border-[#E2E8F0] bg-white text-[#374151] hover:bg-[#F9FAFB]",
								)}
							>
								{currency.label}
							</button>
						))}
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm text-[#6B7280]">{currentSymbol}</span>
						<input
							type="number"
							min={0}
							value={form.price || ""}
							onChange={(e) => handleChange({ price: Number(e.target.value) })}
							placeholder="0"
							className="flex-1 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
						/>
					</div>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						납품 소요일 <span className="text-[#3B82F6]">*</span>
					</label>
					<div className="flex items-center gap-2">
						<input
							type="number"
							min={1}
							value={form.deliveryDays || ""}
							onChange={(e) => handleChange({ deliveryDays: Number(e.target.value) })}
							placeholder="30"
							className="w-28 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
						/>
						<span className="text-sm text-[#6B7280]">일 이내</span>
					</div>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">제안 메모</label>
					<textarea
						value={form.note}
						onChange={(e) => handleChange({ note: e.target.value })}
						placeholder="품질 보증, 대체 사양 제안, 배송 조건 등"
						rows={4}
						className="w-full resize-none rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					/>
				</div>

				<button
					onClick={handleSubmit}
					disabled={isLoading}
					className="w-full rounded-lg bg-[#3B82F6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
				>
					{isLoading ? "제출 중..." : "견적 제출하기"}
				</button>
			</div>
		</div>
	);
}