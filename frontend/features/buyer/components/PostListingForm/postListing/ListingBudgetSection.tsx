"use client";

import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import { cn } from "@/utils/cn";
import type { Currency, ListingFormData } from "@/features/buyer/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
	{ value: "USD", label: "USD", symbol: "$" },
	{ value: "IDR", label: "IDR", symbol: "Rp" },
	{ value: "KRW", label: "KRW", symbol: "₩" },
];

type ListingBudgetSectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingBudgetSection({ form, onChange }: ListingBudgetSectionProps) {
	const currentSymbol = CURRENCIES.find((c) => c.value === form.currency)?.symbol ?? "$";

	return (
		<SectionWrapper title="예산" subtitle="공급기업이 참고할 예산을 알려주세요">
			<div className="space-y-5">
				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">통화</label>
					<div className="flex gap-2">
						{CURRENCIES.map((currency) => (
							<button
								key={currency.value}
								onClick={() => onChange({ currency: currency.value })}
								className={cn(
									"rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors",
									form.currency === currency.value
										? "border-[#3B82F6] bg-[#3B82F6] text-white"
										: "border-[#E2E8F0] bg-white text-[#374151] hover:bg-[#F9FAFB]",
								)}
							>
								{currency.symbol} {currency.label}
							</button>
						))}
					</div>
					<p className="mt-1.5 text-xs text-[#9CA3AF]">
						국제 거래는 보통 USD를 사용합니다.
					</p>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">총 예산</label>
					<div className="flex items-center gap-2">
						<span className="text-sm text-[#6B7280]">{currentSymbol}</span>
						<input
							type="number"
							min={0}
							value={form.totalBudget || ""}
							onChange={(e) => onChange({ totalBudget: Number(e.target.value) })}
							placeholder="0"
							className="flex-1 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
						/>
					</div>
				</div>

				<div className="flex items-center justify-between rounded-lg bg-[#F9FAFB] px-4 py-3">
					<div>
						<p className="text-sm font-medium text-[#374151]">예산 공개</p>
						<p className="text-xs text-[#6B7280]">
							공개하면 더 정확한 견적을 받을 수 있어요
						</p>
					</div>
					<div className="flex gap-1">
						<button
							onClick={() => onChange({ budgetPublic: true })}
							className={cn(
								"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
								form.budgetPublic
									? "bg-[#3B82F6] text-white"
									: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
							)}
						>
							공개
						</button>
						<button
							onClick={() => onChange({ budgetPublic: false })}
							className={cn(
								"rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
								!form.budgetPublic
									? "bg-[#3B82F6] text-white"
									: "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]",
							)}
						>
							비공개
						</button>
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}