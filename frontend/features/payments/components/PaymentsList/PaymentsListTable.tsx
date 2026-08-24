"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, FileText, Loader2, Receipt, Star, Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { ActionButton } from "@/components/ui/ActionButton";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import { getPaymentStatus, PAYMENT_METHOD } from "@/features/payments/constants";
import type { Currency } from "@/features/buyer/types";
import type { Contract } from "@/features/contract/types";
import type { PaymentStatus } from "@/features/payments/types";
import type { MyReview } from "@/features/reviews/types";

const STATUS_STYLE: Record<PaymentStatus, string> = {
	awaitingReceipt: "bg-[#F3F4F6] text-muted",
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
	myReviewMap: Map<string, MyReview>;
	onUploadClick: (contractId: string) => void;
	onViewReceipt: (contractId: string) => void;
	onViewTransactionReceipt: (contractId: string) => void;
	onConfirmPayment: (contractId: string) => void;
	onReview: (contractId: string) => void;
};

export function PaymentsListTable({
	contracts,
	role,
	uploadingId,
	confirmingId,
	receiptPdfLoadingId,
	myReviewMap,
	onUploadClick,
	onViewReceipt,
	onViewTransactionReceipt,
	onConfirmPayment,
	onReview,
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
		<div className="border-hairline hidden overflow-hidden rounded-2xl border bg-white lg:block">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-hairline text-subtle border-b bg-[#F9FAFB] text-left text-xs font-medium">
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
									<td className="text-muted px-4 py-3 font-mono text-xs">
										{formatContractNumber(contract.id)}
									</td>
									<td className="text-ink max-w-[220px] truncate px-4 py-3 font-medium">
										{contract.listing.title}
									</td>
									<td className="text-subtle px-4 py-3 whitespace-nowrap">
										{new Date(contract.createdAt).toLocaleDateString(locale)}
									</td>
									<td className="text-ink px-4 py-3 whitespace-nowrap">
										{CURRENCY_SYMBOL[contract.quote.currency as Currency]}{" "}
										{contract.quote.price.toLocaleString()}
									</td>
									<td className="px-4 py-3 whitespace-nowrap">
										<span className="text-muted rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium">
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
									{/* 계약 관리 테이블과 같은 규칙: 고정 폭 + 세로 스택(w-full)으로 버튼 규격을 통일한다. */}
									<td className="w-44 px-4 py-3 align-top">
										{status === "awaitingReceipt" ? (
											role === "buyer" ? (
												<ActionButton
													onClick={() => onUploadClick(contract.id)}
													disabled={uploadingId === contract.id}
													tone="primaryBlue">
													<Upload size={14} />
													{uploadingId === contract.id ? t("uploading") : t("uploadReceiptButton")}
												</ActionButton>
											) : (
												<span className="text-subtle block text-right text-xs">-</span>
											)
										) : (
											<div className="flex flex-col items-stretch gap-1.5">
												{role === "seller" && status === "awaitingConfirmation" && (
													<ActionButton
														onClick={() => onConfirmPayment(contract.id)}
														disabled={confirmingId === contract.id}
														tone="primary">
														<CheckCircle2 size={14} />
														{confirmingId === contract.id
															? t("processing")
															: t("confirmPaymentButton")}
													</ActionButton>
												)}
												{/* 예전 데이터 중 영수증 없이 완료된 계약이 있어, 실제 파일이 있을 때만 노출한다 */}
												{contract.paymentReceiptUrl && (
													<ActionButton onClick={() => onViewReceipt(contract.id)} tone="secondary">
														<FileText size={14} />
														{role === "seller"
															? t("viewReceiptButtonSeller")
															: t("viewReceiptButton")}
													</ActionButton>
												)}
												{status === "confirmed" && (
													<ActionButton
														onClick={() => onViewTransactionReceipt(contract.id)}
														disabled={receiptPdfLoadingId === contract.id}
														tone="secondarySuccess">
														{receiptPdfLoadingId === contract.id ? (
															<Loader2 size={14} className="animate-spin" />
														) : (
															<Receipt size={14} />
														)}
														{receiptPdfLoadingId === contract.id
															? t("transactionReceiptGenerating")
															: t("transactionReceiptButton")}
													</ActionButton>
												)}
												{status === "confirmed" &&
													(myReviewMap.has(contract.id) ? (
														<span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FFFBEB] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#D97706]">
															<Star size={14} className="fill-[#D97706]" />
															{t("reviewedBadge", {
																rating: myReviewMap.get(contract.id)?.rating ?? 0,
															})}
														</span>
													) : (
														<ActionButton
															onClick={() => onReview(contract.id)}
															tone="secondaryNeutral">
															<Star size={14} />
															{t("reviewButton")}
														</ActionButton>
													))}
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
