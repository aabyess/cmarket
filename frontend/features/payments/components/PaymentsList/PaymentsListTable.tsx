"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, FileText, Loader2, Receipt, Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { getPaymentStatus, PAYMENT_METHOD } from "@/features/payments/constants";
import type { Currency } from "@/features/buyer/types";
import type { Contract } from "@/features/contract/types";
import type { PaymentStatus } from "@/features/payments/types";

const STATUS_STYLE: Record<PaymentStatus, string> = {
	awaitingReceipt: "bg-[#F3F4F6] text-[#6B7280]",
	awaitingConfirmation: "bg-[#FFFBEB] text-[#D97706]",
	confirmed: "bg-[#F0FDF4] text-[#16A34A]",
};

function formatContractNumber(contractId: string): string {
	return contractId.slice(0, 8).toUpperCase();
}

type PaymentsListTableProps = {
	contracts: Contract[];
	role: "buyer" | "seller";
	uploadingId: string | null;
	confirmingId: string | null;
	receiptPdfLoadingId: string | null;
	onUploadClick: (contractId: string) => void;
	onViewReceipt: (contractId: string) => void;
	onViewTransactionReceipt: (contractId: string) => void;
	onConfirmPayment: (contractId: string) => void;
};

export function PaymentsListTable({
	contracts,
	role,
	uploadingId,
	confirmingId,
	receiptPdfLoadingId,
	onUploadClick,
	onViewReceipt,
	onViewTransactionReceipt,
	onConfirmPayment,
}: PaymentsListTableProps): React.ReactNode {
	const t = useTranslations("PaymentsList");
	const locale = useLocale();
	const statusLabels: Record<PaymentStatus, string> = {
		awaitingReceipt:
			role === "seller" ? t("statusAwaitingReceiptSeller") : t("filterAwaitingReceipt"),
		awaitingConfirmation: t("filterAwaitingConfirmation"),
		confirmed: t("filterConfirmed"),
	};
	const methodLabels = { wire: t("methodWire") };

	return (
		<div className="hidden overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white lg:block">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-medium text-[#9CA3AF]">
							<th className="px-4 py-3">{t("columnContractNumber")}</th>
							<th className="px-4 py-3">{t("columnListingTitle")}</th>
							<th className="px-4 py-3">{t("columnTransactionDate")}</th>
							<th className="px-4 py-3">{t("columnAmount")}</th>
							<th className="px-4 py-3">{t("columnMethod")}</th>
							<th className="px-4 py-3">{t("columnStatus")}</th>
							<th className="px-4 py-3 text-right">{t("columnAction")}</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F3F4F6]">
						{contracts.map((contract) => {
							const status = getPaymentStatus(contract);
							return (
								<tr key={contract.id} className="transition-colors hover:bg-[#F9FAFB]">
									<td className="px-4 py-3 font-mono text-xs text-[#6B7280]">
										{formatContractNumber(contract.id)}
									</td>
									<td className="max-w-[220px] truncate px-4 py-3 font-medium text-[#1F2937]">
										{contract.listing.title}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-[#9CA3AF]">
										{new Date(contract.createdAt).toLocaleDateString(locale)}
									</td>
									<td className="px-4 py-3 whitespace-nowrap text-[#1F2937]">
										{CURRENCY_SYMBOL[contract.quote.currency as Currency]}{" "}
										{contract.quote.price.toLocaleString()}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										<span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
											{methodLabels[PAYMENT_METHOD]}
										</span>
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										<span
											className={cn(
												"rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
												STATUS_STYLE[status],
											)}>
											{statusLabels[status]}
										</span>
									</td>
									<td className="px-4 py-3 text-right">
										{status === "awaitingReceipt" ? (
											role === "buyer" ? (
												<button
													type="button"
													onClick={() => onUploadClick(contract.id)}
													disabled={uploadingId === contract.id}
													className="bg-imsg-blue ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
													<Upload size={14} />
													{uploadingId === contract.id ? t("uploading") : t("uploadReceiptButton")}
												</button>
											) : (
												<span className="block text-xs text-[#9CA3AF]">-</span>
											)
										) : (
											<div className="flex flex-wrap items-center justify-end gap-1.5">
												{/* 예전 데이터 중 영수증 없이 완료된 계약이 있어, 실제 파일이 있을 때만 노출한다 */}
												{contract.paymentReceiptUrl && (
													<button
														type="button"
														onClick={() => onViewReceipt(contract.id)}
														className="text-imsg-blue flex items-center gap-1 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-[#DBEAFE]">
														<FileText size={14} />
														{role === "seller"
															? t("viewReceiptButtonSeller")
															: t("viewReceiptButton")}
													</button>
												)}
												{status === "confirmed" && (
													<button
														type="button"
														onClick={() => onViewTransactionReceipt(contract.id)}
														disabled={receiptPdfLoadingId === contract.id}
														className="flex items-center gap-1 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#16A34A] transition-colors hover:bg-[#DCFCE7] disabled:opacity-60">
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
														onClick={() => onConfirmPayment(contract.id)}
														disabled={confirmingId === contract.id}
														className="flex items-center gap-1 rounded-lg bg-[#16A34A] px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#15803D] disabled:opacity-60">
														<CheckCircle2 size={14} />
														{confirmingId === contract.id
															? t("processing")
															: t("confirmPaymentButton")}
													</button>
												)}
											</div>
										)}
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
