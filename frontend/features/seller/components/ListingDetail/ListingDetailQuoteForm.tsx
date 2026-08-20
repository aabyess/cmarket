"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { CheckCircle2, Pencil, Clock, Upload, FileText, X, Loader2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { postQuote, updateQuote, draftQuoteWithAi, QuoteDraftError } from "@/features/seller/mutations";
import type { Currency, ListingAttachment, ListingItem, QuoteItemPrice } from "@/features/buyer/types";
import type { MyQuoteSummary, QuoteDraft, QuoteFormData } from "@/features/seller/types";

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
	{ value: "USD", label: "USD", symbol: "$" },
	{ value: "IDR", label: "IDR", symbol: "Rp" },
	{ value: "KRW", label: "KRW", symbol: "₩" },
];

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

function buildInitialItems(items: ListingItem[], myQuote: MyQuoteSummary | null): QuoteItemPrice[] {
	if (myQuote && myQuote.items.length > 0) return myQuote.items;
	return items.map((item) => ({ itemId: item.id, unitPrice: 0 }));
}

function computeTotal(items: ListingItem[], itemPrices: QuoteItemPrice[]): number {
	return itemPrices.reduce((sum, entry) => {
		const item = items.find((i) => i.id === entry.itemId);
		const quantity = item?.quantity ?? 0;
		return sum + entry.unitPrice * quantity;
	}, 0);
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type ListingDetailQuoteFormProps = {
	listingId: string;
	items: ListingItem[];
	defaultCurrency: Currency;
	myQuote: MyQuoteSummary | null;
	isClosed: boolean;
};

export function ListingDetailQuoteForm({
	listingId,
	items,
	defaultCurrency,
	myQuote,
	isClosed,
}: ListingDetailQuoteFormProps) {
	const t = useTranslations("ListingDetailQuoteForm");
	const router = useRouter();
	const [isEditing, setIsEditing] = useState(false);
	const [showItemsBreakdown, setShowItemsBreakdown] = useState(false);
	const [form, setForm] = useState<QuoteFormData>({
		price: myQuote?.price ?? 0,
		currency: myQuote?.currency ?? defaultCurrency,
		deliveryDays: myQuote?.deliveryDays ?? 0,
		note: myQuote?.note ?? "",
		items: buildInitialItems(items, myQuote),
		attachments: myQuote?.attachments ?? [],
		paymentTerms: myQuote?.paymentTerms ?? "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isDrafting, setIsDrafting] = useState(false);
	const [pendingDraft, setPendingDraft] = useState<QuoteDraft | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const locale = useLocale();

	const currentSymbol = CURRENCIES.find((c) => c.value === form.currency)?.symbol ?? "$";
	const total = computeTotal(items, form.items);

	function handleChange(patch: Partial<QuoteFormData>) {
		setForm((prev) => ({ ...prev, ...patch }));
		setError(null);
	}

	function applyDraft(draft: QuoteDraft) {
		handleChange({ note: draft.note, paymentTerms: draft.paymentTerms });
	}

	async function handleAiDraft(): Promise<void> {
		if (isDrafting) return;
		setIsDrafting(true);
		setError(null);
		try {
			const draft = await draftQuoteWithAi(listingId, locale);
			// 이미 써둔 내용이 있으면 덮어쓰기 전에 확인받는다.
			if (form.note.trim() || form.paymentTerms.trim()) {
				setPendingDraft(draft);
			} else {
				applyDraft(draft);
			}
		} catch (err) {
			if (err instanceof QuoteDraftError && err.status === 503) {
				setError(t("aiNotConfigured"));
			} else if (err instanceof QuoteDraftError && err.status === 429) {
				setError(t("aiRateLimited"));
			} else {
				setError(t("aiDraftError"));
			}
		} finally {
			setIsDrafting(false);
		}
	}

	function handleConfirmDraftOverwrite() {
		if (pendingDraft) applyDraft(pendingDraft);
		setPendingDraft(null);
	}

	function handleItemPriceChange(itemId: string, unitPrice: number) {
		handleChange({
			items: form.items.map((entry) => (entry.itemId === itemId ? { ...entry, unitPrice } : entry)),
		});
	}

	async function uploadFiles(files: FileList): Promise<void> {
		const remaining = MAX_ATTACHMENTS - form.attachments.length;
		if (remaining <= 0) {
			alert(t("maxAttachmentsError", { max: MAX_ATTACHMENTS }));
			return;
		}

		const targets = Array.from(files).slice(0, remaining);
		setIsUploading(true);

		try {
			const uploaded: ListingAttachment[] = [];

			for (const file of targets) {
				if (file.size > MAX_ATTACHMENT_SIZE) {
					alert(t("attachmentTooLarge", { fileName: file.name }));
					continue;
				}

				const formData = new FormData();
				formData.append("file", file);

				const res = await fetch("/api/seller/upload-quote-attachment", {
					method: "POST",
					body: formData,
				});

				if (!res.ok) {
					const { error: uploadError } = await res.json();
					alert(t("attachmentUploadFailed", { fileName: file.name, error: uploadError }));
					continue;
				}

				const data = await res.json();
				uploaded.push({
					id: crypto.randomUUID(),
					fileName: data.fileName,
					storagePath: data.storagePath,
					fileSize: data.fileSize,
				});
			}

			if (uploaded.length > 0) {
				handleChange({ attachments: [...form.attachments, ...uploaded] });
			}
		} finally {
			setIsUploading(false);
		}
	}

	function handleRemoveAttachment(id: string): void {
		handleChange({ attachments: form.attachments.filter((a) => a.id !== id) });
	}

	function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
	}

	function validate(): boolean {
		if (total <= 0) {
			setError(t("priceRequiredError"));
			return false;
		}
		if (form.deliveryDays <= 0) {
			setError(t("deliveryDaysRequiredError"));
			return false;
		}
		return true;
	}

	async function handleSubmit() {
		if (!validate()) return;

		setIsLoading(true);
		try {
			await postQuote(listingId, { ...form, price: total });
			router.refresh();
		} catch (err) {
			console.error(err);
			setError(t("submitError"));
		} finally {
			setIsLoading(false);
		}
	}

	async function handleUpdate() {
		if (!validate() || !myQuote) return;

		setIsLoading(true);
		try {
			await updateQuote(myQuote.id, { ...form, price: total });
			setIsEditing(false);
			router.refresh();
		} catch (err) {
			console.error(err);
			setError(t("updateError"));
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
			items: buildInitialItems(items, myQuote),
			attachments: myQuote?.attachments ?? [],
			paymentTerms: myQuote?.paymentTerms ?? "",
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
							{t("statusAwarded")}
						</span>
					) : myQuote.status === "rejected" ? (
						<span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
							{t("statusRejected")}
						</span>
					) : (
						<span className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-medium text-imsg-blue">
							<Clock size={12} />
							{t("statusPending")}
						</span>
					)}
				</div>

				<p className="text-sm font-semibold text-[#1F2937]">{t("sentQuoteLabel")}</p>

				<div className="mt-3 flex items-center gap-6 border-t border-[#F3F4F6] pt-3">
					<div>
						<p className="text-xs text-[#9CA3AF]">{t("priceLabel")}</p>
						<p className="text-lg font-semibold text-[#1F2937]">
							{symbol} {myQuote.price.toLocaleString()}
						</p>
					</div>
					<div>
						<p className="text-xs text-[#9CA3AF]">{t("deliveryLabel")}</p>
						<p className="text-lg font-semibold text-[#1F2937]">
							{t("daysSuffix", { days: myQuote.deliveryDays })}
						</p>
					</div>
				</div>

				{myQuote.items.length > 0 && (
					<div className="mt-3 border-t border-[#F3F4F6] pt-3">
						<button
							onClick={() => setShowItemsBreakdown((prev) => !prev)}
							className="flex w-full items-center justify-between text-xs font-medium text-[#374151]"
						>
							{t("itemsBreakdownToggle")}
							{showItemsBreakdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
						</button>
						{showItemsBreakdown && (
							<ul className="mt-2 space-y-1.5">
								{myQuote.items.map((entry) => {
									const item = items.find((i) => i.id === entry.itemId);
									if (!item) return null;
									return (
										<li key={entry.itemId} className="flex items-center justify-between text-xs text-[#374151]">
											<span className="min-w-0 truncate">{item.name}</span>
											<span className="shrink-0 text-[#9CA3AF]">
												{symbol} {entry.unitPrice.toLocaleString()} × {item.quantity}{item.unit}
											</span>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				)}

				{myQuote.paymentTerms && (
					<div className="mt-3 border-t border-[#F3F4F6] pt-3 text-xs text-[#374151]">
						<p className="text-[#9CA3AF]">{t("paymentTermsLabel")}</p>
						<p className="mt-0.5 whitespace-pre-wrap">{myQuote.paymentTerms}</p>
					</div>
				)}

				{myQuote.attachments.length > 0 && (
					<ul className="mt-3 space-y-1.5 border-t border-[#F3F4F6] pt-3">
						{myQuote.attachments.map((attachment) => (
							<li
								key={attachment.id}
								className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2"
							>
								<FileText size={13} className="shrink-0 text-[#9CA3AF]" />
								<span className="min-w-0 flex-1 truncate text-xs text-[#374151]">{attachment.fileName}</span>
								<span className="shrink-0 text-xs text-[#9CA3AF]">{formatFileSize(attachment.fileSize)}</span>
							</li>
						))}
					</ul>
				)}

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
							{t("editButton")}
						</button>
						<p className="mt-2 text-center text-xs text-[#9CA3AF]">
							{t("editHint")}
						</p>
					</>
				) : (
					<button
						onClick={() => router.push("/seller/quote-submit")}
						className="mt-4 w-full rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50"
					>
						{t("viewSentQuotesButton")}
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
				<p className="text-sm font-medium text-[#1F2937]">{t("closedTitle")}</p>
				<p className="mt-1 text-sm text-[#6B7280]">{t("closedDescription")}</p>
			</div>
		);
	}

	// 제출 폼 또는 수정 폼
	return (
		<div className="rounded-2xl border-2 border-imsg-blue bg-white p-5">
			<p className="text-sm font-semibold text-[#1F2937]">
				{isEditing ? t("editTitle") : t("newTitle")}
			</p>
			<p className="mt-1 text-xs text-[#6B7280]">
				{isEditing
					? t("editSubtitle")
					: t("newSubtitle")}
			</p>

			<div className="mt-4 space-y-4">
				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						{t("priceFieldLabel")} <span className="text-imsg-blue">*</span>
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

					<div className="space-y-2">
						{items.map((item) => {
							const entry = form.items.find((e) => e.itemId === item.id);
							const unitPrice = entry?.unitPrice ?? 0;
							const subtotal = unitPrice * item.quantity;

							return (
								<div key={item.id} className="rounded-lg border border-[#E2E8F0] p-3">
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0">
											<p className="truncate text-sm font-medium text-[#1F2937]">{item.name}</p>
											{item.spec && <p className="truncate text-xs text-[#9CA3AF]">{item.spec}</p>}
										</div>
										<span className="shrink-0 text-xs text-[#6B7280]">
											{item.quantity} {item.unit}
										</span>
									</div>
									<div className="mt-2 flex items-center gap-2">
										<span className="text-sm text-[#6B7280]">{currentSymbol}</span>
										<input
											type="number"
											min={0}
											value={unitPrice || ""}
											onChange={(e) => handleItemPriceChange(item.id, Number(e.target.value))}
											placeholder={t("pricePlaceholder")}
											className="flex-1 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
										/>
										<span className="shrink-0 text-xs text-[#9CA3AF]">
											= {currentSymbol} {subtotal.toLocaleString()}
										</span>
									</div>
								</div>
							);
						})}
					</div>

					<div className="mt-2 flex items-center justify-between rounded-lg bg-[#F9FAFB] px-3 py-2.5">
						<span className="text-sm font-medium text-[#374151]">{t("totalLabel")}</span>
						<span className="text-base font-semibold text-[#1F2937]">
							{currentSymbol} {total.toLocaleString()}
						</span>
					</div>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">
						{t("deliveryFieldLabel")} <span className="text-imsg-blue">*</span>
					</label>
					<div className="flex items-center gap-2">
						<input
							type="number"
							min={1}
							value={form.deliveryDays || ""}
							onChange={(e) => handleChange({ deliveryDays: Number(e.target.value) })}
							placeholder={t("deliveryDaysPlaceholder")}
							className="w-28 rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
						/>
						<span className="text-sm text-[#6B7280]">{t("deliveryDaysSuffix")}</span>
					</div>
				</div>

				<div>
					<div className="mb-2 flex items-center justify-between">
						<label className="block text-sm font-medium text-[#374151]">{t("paymentTermsFieldLabel")}</label>
						<button
							type="button"
							onClick={handleAiDraft}
							disabled={isDrafting}
							className="flex items-center gap-1 rounded-md border border-imsg-blue px-2 py-1 text-xs font-semibold text-imsg-blue transition-colors hover:bg-[#EFF6FF] disabled:opacity-60"
						>
							{isDrafting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
							{isDrafting ? t("aiDrafting") : t("aiDraftButton")}
						</button>
					</div>
					<input
						type="text"
						value={form.paymentTerms}
						onChange={(e) => handleChange({ paymentTerms: e.target.value })}
						placeholder={t("paymentTermsPlaceholder")}
						className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
					/>
				</div>

				<ConfirmModal
					isOpen={pendingDraft !== null}
					title={t("aiOverwriteTitle")}
					description={t("aiOverwriteDescription")}
					onConfirm={handleConfirmDraftOverwrite}
					onClose={() => setPendingDraft(null)}
				/>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">{t("noteFieldLabel")}</label>
					<textarea
						value={form.note}
						onChange={(e) => handleChange({ note: e.target.value })}
						placeholder={t("notePlaceholder")}
						rows={4}
						className="w-full resize-none rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-medium text-[#374151]">{t("attachmentsFieldLabel")}</label>
					<div
						onClick={() => fileInputRef.current?.click()}
						onDragOver={(e) => {
							e.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={handleDrop}
						className={cn(
							"flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border py-6 text-center transition-colors",
							isDragging
								? "border-dashed border-imsg-blue bg-[#EFF6FF]"
								: "border-[#E2E8F0] bg-[#F9FAFB] hover:border-dashed hover:border-imsg-blue",
						)}
					>
						{isUploading ? (
							<Loader2 size={18} className="animate-spin text-imsg-blue" />
						) : (
							<Upload size={18} className="text-[#9CA3AF]" />
						)}
						<p className="text-xs text-[#374151]">{t("attachmentsDropzoneText")}</p>
						<p className="text-xs text-[#9CA3AF]">{t("attachmentsMaxSize")}</p>
						<input
							ref={fileInputRef}
							type="file"
							multiple
							accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
							className="hidden"
							onChange={(e) => {
								if (e.target.files) uploadFiles(e.target.files);
								e.target.value = "";
							}}
						/>
					</div>

					{form.attachments.length > 0 && (
						<ul className="mt-2 space-y-1.5">
							{form.attachments.map((attachment) => (
								<li
									key={attachment.id}
									className="flex items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2"
								>
									<div className="flex min-w-0 items-center gap-2">
										<FileText size={13} className="shrink-0 text-[#9CA3AF]" />
										<span className="truncate text-xs text-[#374151]">{attachment.fileName}</span>
										<span className="shrink-0 text-xs text-[#9CA3AF]">{formatFileSize(attachment.fileSize)}</span>
									</div>
									<button
										onClick={() => handleRemoveAttachment(attachment.id)}
										className="shrink-0 text-[#D1D5DB] transition-colors hover:text-[#EF4444]"
									>
										<X size={13} />
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				{error && <p className="text-sm text-red-500">{error}</p>}

				{isEditing ? (
					<div className="flex gap-2">
						<button
							onClick={handleCancelEdit}
							disabled={isLoading}
							className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50"
						>
							{t("cancelButton")}
						</button>
						<button
							onClick={handleUpdate}
							disabled={isLoading}
							className="flex-1 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
						>
							{isLoading ? t("savingButton") : t("saveButton")}
						</button>
					</div>
				) : (
					<button
						onClick={handleSubmit}
						disabled={isLoading}
						className="w-full rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
					>
						{isLoading ? t("submittingButton") : t("submitButton")}
					</button>
				)}
			</div>
		</div>
	);
}
