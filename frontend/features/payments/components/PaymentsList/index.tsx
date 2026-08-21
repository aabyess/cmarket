"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, CreditCard, FileText, Loader2, Receipt, Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePersistentState } from "@/hooks/usePersistentState";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Pagination } from "@/components/commons/Pagination";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { getPaymentStatus, PAYMENT_METHOD } from "@/features/payments/constants";
import { PaymentsListFilterBar } from "@/features/payments/components/PaymentsList/PaymentsListFilterBar";
import { PaymentsListTable } from "@/features/payments/components/PaymentsList/PaymentsListTable";
import type { Currency } from "@/features/buyer/types";
import type { Contract } from "@/features/contract/types";
import type { PaymentFilter, PaymentStatus } from "@/features/payments/types";

const STATUS_STYLE: Record<PaymentStatus, string> = {
	awaitingReceipt: "bg-[#F3F4F6] text-[#6B7280]",
	awaitingConfirmation: "bg-[#FFFBEB] text-[#D97706]",
	confirmed: "bg-[#F0FDF4] text-[#16A34A]",
};

type PaymentsListPrefs = {
	filter: PaymentFilter;
	pageSize: number;
};

const DEFAULT_PREFS: PaymentsListPrefs = {
	filter: "all",
	pageSize: 10,
};

function formatContractNumber(contractId: string): string {
	return contractId.slice(0, 8).toUpperCase();
}

type PaymentsListProps = {
	contracts: Contract[];
	role: "buyer" | "seller";
};

export function PaymentsList({ contracts: allContracts, role }: PaymentsListProps): React.ReactNode {
	// 취소된 계약은 결제창에서는 숨긴다 — 계약 관리 페이지에는 그대로 노출된다.
	const contracts = allContracts.filter((contract) => contract.status !== "cancelled");
	const t = useTranslations("PaymentsList");
	const router = useRouter();
	const locale = useLocale();
	const statusLabels: Record<PaymentStatus, string> = {
		awaitingReceipt:
			role === "seller" ? t("statusAwaitingReceiptSeller") : t("filterAwaitingReceipt"),
		awaitingConfirmation: t("filterAwaitingConfirmation"),
		confirmed: t("filterConfirmed"),
	};
	const methodLabels = { wire: t("methodWire") };

	const [search, setSearch] = useState("");
	const [prefs, setPrefs] = usePersistentState<PaymentsListPrefs>(`mitrapay:payments-${role}`, DEFAULT_PREFS);
	const { filter, pageSize } = prefs;
	const [uploadingId, setUploadingId] = useState<string | null>(null);
	const [confirmingId, setConfirmingId] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [receiptPdfLoadingId, setReceiptPdfLoadingId] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

	function setFilter(filter: PaymentFilter): void {
		setPrefs((prev) => ({ ...prev, filter }));
	}

	function setPageSize(pageSize: number): void {
		setPrefs((prev) => ({ ...prev, pageSize }));
	}

	async function handleReceiptUpload(contractId: string, file: File): Promise<void> {
		setUploadingId(contractId);
		try {
			const formData = new FormData();
			formData.append("contractId", contractId);
			formData.append("file", file);

			const res = await fetch("/api/contract/receipt", {
				method: "POST",
				body: formData,
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("receiptUploadErrorMessage"));
		} finally {
			setUploadingId(null);
		}
	}

	async function handleViewReceipt(contractId: string): Promise<void> {
		try {
			const res = await fetch(`/api/contract/receipt-url?contractId=${contractId}`);
			if (!res.ok) throw new Error("URL 생성 실패");
			const { url } = await res.json();
			window.open(url, "_blank");
		} catch (err) {
			console.error(err);
			alert(t("receiptViewErrorMessage"));
		}
	}

	async function handleViewTransactionReceipt(contractId: string): Promise<void> {
		setReceiptPdfLoadingId(contractId);
		try {
			const res = await fetch("/api/payments/receipt-pdf", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contractId, locale }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			window.open(url, "_blank");
		} catch (err) {
			console.error(err);
			alert(t("transactionReceiptErrorMessage"));
		} finally {
			setReceiptPdfLoadingId(null);
		}
	}

	async function handleConfirmPayment(contractId: string): Promise<void> {
		setConfirmingId(contractId);
		try {
			const res = await fetch("/api/contract/status", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contractId, status: "completed" }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("confirmPaymentErrorMessage"));
		} finally {
			setConfirmingId(null);
			setConfirmId(null);
		}
	}

	const keyword = search.trim().toLowerCase();
	const visibleContracts = contracts
		.filter((contract) => filter === "all" || getPaymentStatus(contract) === filter)
		.filter((contract) => {
			if (!keyword) return true;
			return (
				formatContractNumber(contract.id).toLowerCase().includes(keyword) ||
				contract.listing.title.toLowerCase().includes(keyword)
			);
		});

	useEffect(() => {
		setPage(1);
	}, [filter, search, pageSize]);

	const pageCount = Math.max(1, Math.ceil(visibleContracts.length / pageSize));
	const paginatedContracts = visibleContracts.slice((page - 1) * pageSize, page * pageSize);

	if (contracts.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<CreditCard size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-base font-medium text-[#1F2937]">{t("emptyTitle")}</p>
				<p className="mt-1 text-sm text-[#6B7280]">{t("emptyDescription")}</p>
			</div>
		);
	}

	return (
		<>
			<PaymentsListFilterBar
				search={search}
				onSearchChange={setSearch}
				filter={filter}
				onFilterChange={setFilter}
			/>

			{/* 영수증 업로드용 파일 인풋 — 셀러는 업로드할 수 없다 */}
			{role === "buyer" &&
				paginatedContracts.map((contract) => (
					<input
						key={contract.id}
						ref={(el) => {
							fileInputRefs.current[contract.id] = el;
						}}
						type="file"
						accept="image/*,.pdf"
						className="hidden"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) handleReceiptUpload(contract.id, file);
						}}
					/>
				))}

			{visibleContracts.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<p className="text-sm text-[#6B7280]">{t("noResults")}</p>
				</div>
			) : (
				<>
					<PaymentsListTable
						contracts={paginatedContracts}
						role={role}
						uploadingId={uploadingId}
						confirmingId={confirmingId}
						receiptPdfLoadingId={receiptPdfLoadingId}
						onUploadClick={(contractId) => fileInputRefs.current[contractId]?.click()}
						onViewReceipt={handleViewReceipt}
						onViewTransactionReceipt={handleViewTransactionReceipt}
						onConfirmPayment={setConfirmId}
					/>

					{/* 좁은 화면용 카드 스택 */}
					<div className="space-y-3 lg:hidden">
						{paginatedContracts.map((contract) => {
							const status = getPaymentStatus(contract);
							return (
								<div key={contract.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
									<div className="flex items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="font-mono text-xs text-[#9CA3AF]">
												{formatContractNumber(contract.id)}
											</p>
											<p className="mt-0.5 truncate text-sm font-semibold text-[#1F2937]">
												{contract.listing.title}
											</p>
										</div>
										<span
											className={cn(
												"shrink-0 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
												STATUS_STYLE[status],
											)}>
											{statusLabels[status]}
										</span>
									</div>

									<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
										<span>{new Date(contract.createdAt).toLocaleDateString(locale)}</span>
										<span className="font-medium text-[#1F2937]">
											{CURRENCY_SYMBOL[contract.quote.currency as Currency]}{" "}
											{contract.quote.price.toLocaleString()}
										</span>
										<span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs text-[#6B7280]">
											{methodLabels[PAYMENT_METHOD]}
										</span>
									</div>

									{status === "awaitingReceipt" ? (
										role === "buyer" && (
											<button
												type="button"
												onClick={() => fileInputRefs.current[contract.id]?.click()}
												disabled={uploadingId === contract.id}
												className="bg-imsg-blue mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
												<Upload size={14} />
												{uploadingId === contract.id ? t("uploading") : t("uploadReceiptButton")}
											</button>
										)
									) : (
										<div className="mt-4 flex flex-wrap gap-2">
											{/* 예전 데이터 중 영수증 없이 완료된 계약이 있어, 실제 파일이 있을 때만 노출한다 */}
											{contract.paymentReceiptUrl && (
												<button
													type="button"
													onClick={() => handleViewReceipt(contract.id)}
													className="text-imsg-blue flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] py-2.5 text-xs font-medium transition-colors hover:bg-[#DBEAFE]">
													<FileText size={14} />
													{role === "seller" ? t("viewReceiptButtonSeller") : t("viewReceiptButton")}
												</button>
											)}
											{status === "confirmed" && (
												<button
													type="button"
													onClick={() => handleViewTransactionReceipt(contract.id)}
													disabled={receiptPdfLoadingId === contract.id}
													className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] py-2.5 text-xs font-medium text-[#16A34A] transition-colors hover:bg-[#DCFCE7] disabled:opacity-60">
													{receiptPdfLoadingId === contract.id ? (
														<Loader2 size={14} className="animate-spin" />
													) : (
														<Receipt size={14} />
													)}
													{receiptPdfLoadingId === contract.id
														? t("transactionReceiptGenerating")
														: t("transactionReceiptButton")}
												</button>
											)}
											{role === "seller" && status === "awaitingConfirmation" && (
												<button
													type="button"
													onClick={() => setConfirmId(contract.id)}
													disabled={confirmingId === contract.id}
													className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#16A34A] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#15803D] disabled:opacity-60">
													<CheckCircle2 size={14} />
													{confirmingId === contract.id
														? t("processing")
														: t("confirmPaymentButton")}
												</button>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</>
			)}

			{visibleContracts.length > 0 && (
				<Pagination
					page={page}
					pageCount={pageCount}
					pageSize={pageSize}
					onPageChange={setPage}
					onPageSizeChange={setPageSize}
				/>
			)}

			<ConfirmModal
				isOpen={confirmId !== null}
				title={t("confirmPaymentModalTitle")}
				description={t("confirmPaymentModalDescription")}
				confirmLabel={t("confirmPaymentButton")}
				isLoading={confirmingId === confirmId}
				onConfirm={() => confirmId && handleConfirmPayment(confirmId)}
				onClose={() => setConfirmId(null)}
			/>
		</>
	);
}
