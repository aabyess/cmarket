"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, Pencil, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import { postQuote, updateQuote } from "@/features/seller/mutations";
import type { Currency } from "@/features/buyer/types";
import type { MyQuoteSummary, QuoteFormData } from "@/features/seller/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
	{ value: "USD", label: "USD", symbol: "$" },
	{ value: "IDR", label: "IDR", symbol: "Rp" },
	{ value: "KRW", label: "KRW", symbol: "₩" },
];

type ListingDetailQuoteFormProps = {
	listingId: string;
	defaultCurrency: Currency;
	myQuote: MyQuoteSummary | null;
	isClosed: boolean;
};

export function ListingDetailQuoteForm({
	listingId,
	defaultCurrency,
	myQuote,
	isClosed,
}: ListingDetailQuoteFormProps) {
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [form, setForm] = useState<QuoteFormData>({
		price: myQuote?.price ?? 0,
		currency: myQuote?.currency ?? defaultCurrency,
		deliveryDays: myQuote?.deliveryDays ?? 0,
		note: myQuote?.note ?? "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentSymbol = CURRENCIES.find((c) => c.value === form.currency)?.symbol ?? "$";

	function handleChange(patch: Partial<QuoteFormData>) {
		setForm((prev) => ({ ...prev, ...patch }));
		setError(null);
	}

	function validate(): boolean {
		if (form.price <= 0) {
			setError("견적 금액을 입력해주세요.");
			return false;
		}
		if (form.deliveryDays <= 0) {
			setError("납품 소요일을 입력해주세요.");
			return false;
		}
		return true;
	}

	async function handleSubmit() {
		if (!validate()) return;

		setIsLoading(true);
		try {
			await postQuote(listingId, form);
			router.refresh();
		} catch (err) {
			console.error(err);
			setError("견적 제출에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	}

	async function handleUpdate() {
		if (!validate() || !myQuote) return;

		setIsLoading(true);
		try {
			await updateQuote(myQuote.id, form);
			setIsEditing(false);
			router.refresh();
		} catch (err) {
			console.error(err);
			setError("견적 수정에 실패했습니다.");
		} finally {
			setIsLoading(false);
		}
	}

	function handleCancelEdit() {
		setForm({
			price: myQuote?.price ?? 0,
			currency: myQuote?.currency ?? defaultCurrency,
			deliveryDays: myQuote?.deliveryDays ?? 0,
			note: myQuote?.note ?? "",
		});
		setError(null);
		setIsEditing(false);
	}

	// 제출한 견적이 있고 수정 모드가 아닐 때
	if (myQuote && !isEditing) {
		const symbol = CURRENCIES.find((c) => c.value === myQuote.currency)?.symbol ?? "$";
		const canEdit = myQuote.status === "pending" && !isClosed;

		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
				<div className="mb-4 flex items-center gap-2">
					{myQuote.status === "awarded" ? (
						<span className="flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-medium text-[#059669]">
							<CheckCircle2 size={12} />
							계약 확정
						</span>
					) : myQuote.status === "rejected" ? (
						<span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
							미선정
						</span>
					) : (
						<span className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-imsg-blue">
							<Clock size={12} />
							검토 중
						</span>
					)}
				</div>

				<p className="text-sm font-semibold text-[#1F2937]">보낸 견적</p>

				<div className="mt-3 flex items-center gap-6 border-t border-[#F3F4F6] pt-3">
					<div>
						<p className="text-xs text-[#9CA3AF]">견적가</p>
						<p className="text-lg font-semibold text-[#1F2937]">
							{symbol} {myQuote.price.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-xs text-[#9CA3AF]">납품</p>
						<p className="text-lg font-semibold text-[#1F2937]">
							{myQuote.deliveryDays}일
						</p>
					</div>
				</div>

				{myQuote.note && (
					<p className="mt-3 whitespace-pre-wrap rounded-lg bg-[#F9FAFB] px-3 py-2.5 text-xs leading-relaxed text-[#374151]">
						{myQuote.note}
					</p>
				)}

				{canEdit ? (
					<>
						<button
							onClick={() => setIsEditing(true)}
							className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-imsg-blue py-3 text-sm font-semibold text-imsg-blue transition-colors hover:bg-[#EFF6FF]"
						>
							<Pencil size={15} />
							견적 수정하기
						</button>
						<p className="mt-2 text-center text-xs text-[#9CA3AF]">
							마감 전까지 수정할 수 있어요
						</p>
					</>
				) : (
					<button
						onClick={() => router.push("/seller/quote-submit")}
						className="mt-4 w-full rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50"
					>
						보낸 견적 목록
					</button>
				)}
			</div>
		);
	}

	// 마감된 공고에 견적 없음
	if (isClosed && !myQuote) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center">
				<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-[#F3F4F6]">
					<Clock size={22} className="text-[#9CA3AF]" />
				</div>
				<p className="text-sm font-medium text-[#1F2937]">마감된 견적요청입니다</p>
				<p className="mt-1 text-sm text-[#6B7280]">더 이상 견적을 보낼 수 없어요.</p>
			</div>
		);
	}

	// 제출 폼 또는 수정 폼
	return (
		<div className="rounded-2xl border-2 border-imsg-blue bg-white p-5">
			<p className="text-sm font-semibold text-[#1F2937]">
				{isEditing ? "견적 수정" : "견적 보내기"}
			</p>
			<p className="mt-1 text-xs text-[#6B7280]">
				{isEditing
					? "수정 내역은 발주기관에게 표시돼요."
					: "마감 전까지 언제든 수정할 수 있어요."}
			</p>

			<div className="mt-4 space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						견적 금액 <span className="text-imsg-blue">*</span>
					</label>
					<div className="mb-2 flex gap-1.5">
						{CURRENCIES.map((currency) => (
							<button
								key={currency.value}
								onClick={() => handleChange({ currency: currency.value })}
								className={cn(
									"flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
									form.currency === currency.value
										? "border-imsg-blue bg-imsg-blue text-white"
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
							className="flex-1 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
						/>
					</div>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						납품 소요일 <span className="text-imsg-blue">*</span>
					</label>
					<div className="flex items-center gap-2">
						<input
							type="number"
							min={1}
							value={form.deliveryDays || ""}
							onChange={(e) => handleChange({ deliveryDays: Number(e.target.value) })}
							placeholder="30"
							className="w-28 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
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
						className="w-full resize-none rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
					/>
				</div>

				{error && <p className="text-sm text-red-500">{error}</p>}

				{isEditing ? (
					<div className="flex gap-2">
						<button
							onClick={handleCancelEdit}
							disabled={isLoading}
							className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
						>
							취소
						</button>
						<button
							onClick={handleUpdate}
							disabled={isLoading}
							className="flex-1 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
						>
							{isLoading ? "저장 중..." : "수정 저장"}
						</button>
					</div>
				) : (
					<button
						onClick={handleSubmit}
						disabled={isLoading}
						className="w-full rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
					>
						{isLoading ? "제출 중..." : "견적 제출하기"}
					</button>
				)}
			</div>
		</div>
	);
}