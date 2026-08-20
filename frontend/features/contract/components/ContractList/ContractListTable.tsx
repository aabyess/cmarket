"use client";

import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, FileText, Upload, PackageCheck, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Contract, ContractStatus } from "@/features/contract/types";

const CURRENCY_SYMBOL: Record<string, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_STYLE: Record<ContractStatus, string> = {
	ongoing: "bg-[#EFF6FF] text-imsg-blue",
	completed: "bg-[#F0FDF4] text-[#16A34A]",
	cancelled: "bg-[#FEF2F2] text-[#DC2626]",
};

type ContractListTableProps = {
	contracts: Contract[];
	role: "buyer" | "seller";
	loadingId: string | null;
	uploadingId: string | null;
	onUploadClick: (contractId: string) => void;
	onViewReceipt: (contractId: string) => void;
	onRequestConfirm: (contractId: string) => void;
	onRequestCancel: (contractId: string) => void;
	onRequestDeliveryConfirm: (contractId: string) => void;
	onRequestReceiptDelete: (contractId: string) => void;
	onOpenDetail: (listingId: string) => void;
};

export function ContractListTable({
	contracts,
	role,
	loadingId,
	uploadingId,
	onUploadClick,
	onViewReceipt,
	onRequestConfirm,
	onRequestCancel,
	onRequestDeliveryConfirm,
	onRequestReceiptDelete,
	onOpenDetail,
}: ContractListTableProps): React.ReactNode {
	const t = useTranslations("ContractListTable");
	const locale = useLocale();
	const statusLabels: Record<ContractStatus, string> = {
		ongoing: t("statusOngoing"),
		completed: t("statusCompleted"),
		cancelled: t("statusCancelled"),
	};

	return (
		<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-medium text-[#9CA3AF]">
							<th className="px-4 py-3">{t("columnStatus")}</th>
							<th className="px-4 py-3">{t("columnTitle")}</th>
							<th className="px-4 py-3">{t("columnPartner")}</th>
							<th className="px-4 py-3">{t("columnAmount")}</th>
							<th className="px-4 py-3">{t("columnDelivery")}</th>
							<th className="px-4 py-3">{t("columnContractDate")}</th>
							<th className="px-4 py-3 text-right">{t("columnAction")}</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F3F4F6]">
						{contracts.map((contract) => (
							<tr
								key={contract.id}
								onClick={() => onOpenDetail(contract.listingId)}
								className={cn(
									"cursor-pointer transition-colors hover:bg-[#F9FAFB]",
									contract.status !== "ongoing" && "opacity-75",
								)}>
								<td className="px-4 py-3 whitespace-nowrap">
									<span
										className={cn(
											"rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
											STATUS_STYLE[contract.status],
										)}>
										{statusLabels[contract.status]}
									</span>
								</td>
								<td className="max-w-[200px] truncate px-4 py-3 font-medium text-[#1F2937]">
									{contract.listing.title}
								</td>
								<td className="max-w-[160px] truncate px-4 py-3 text-[#6B7280]">
									{contract.partnerCompanyName || t("noPartnerCompanyName")}
								</td>
								<td className="px-4 py-3 text-[#1F2937]">
									{CURRENCY_SYMBOL[contract.quote.currency]} {contract.quote.price.toLocaleString()}
								</td>
								<td className="px-4 py-3 text-[#6B7280]">
									{t("days", { count: contract.quote.deliveryDays })}
								</td>
								<td className="px-4 py-3 text-[#9CA3AF]">
									{new Date(contract.createdAt).toLocaleDateString(locale)}
								</td>
								{/* 액션 칸 — 버튼 클릭이 행 이동으로 번지지 않게 막는다 */}
								<td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
									{contract.status === "cancelled" ? (
										<span className="block text-right text-xs text-[#9CA3AF]">-</span>
									) : (
										<div className="flex flex-wrap items-center justify-end gap-1">
											{contract.status === "ongoing" && role === "buyer" && (
												<>
													{contract.paymentReceiptUrl ? (
														<button
															onClick={() => onViewReceipt(contract.id)}
															className="text-imsg-blue flex items-center gap-1 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-[#DBEAFE]">
															<FileText size={14} />
															{t("viewReceiptTitle")}
														</button>
													) : null}
													<button
														onClick={() => onUploadClick(contract.id)}
														disabled={uploadingId === contract.id}
														className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60">
														<Upload size={14} />
														{contract.paymentReceiptUrl
															? t("reuploadReceiptTitle")
															: t("uploadReceiptTitle")}
													</button>
													{contract.paymentReceiptUrl ? (
														<button
															onClick={() => onRequestReceiptDelete(contract.id)}
															disabled={loadingId === contract.id}
															className="flex items-center gap-1 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#DC2626] transition-colors hover:bg-[#FEE2E2] disabled:opacity-60">
															<Trash2 size={14} />
															{t("deleteReceiptTitle")}
														</button>
													) : null}
												</>
											)}
											{contract.status === "ongoing" && role === "seller" && (
												<>
													{contract.paymentReceiptUrl && (
														<button
															onClick={() => onViewReceipt(contract.id)}
															className="text-imsg-blue flex items-center gap-1 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:bg-[#DBEAFE]">
															<FileText size={14} />
															{t("confirmReceiptTitle")}
														</button>
													)}
													<button
														onClick={() => onRequestConfirm(contract.id)}
														disabled={loadingId === contract.id || !contract.paymentReceiptUrl}
														className={cn(
															"flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-60",
															contract.paymentReceiptUrl
																? "bg-[#16A34A] text-white hover:bg-[#15803D]"
																: "border border-[#E5E7EB] text-[#9CA3AF]",
														)}>
														<CheckCircle2 size={14} />
														{t("confirmPaymentTitle")}
													</button>
												</>
											)}
											{contract.status === "ongoing" && !contract.paymentReceiptUrl && (
												<button
													onClick={() => onRequestCancel(contract.id)}
													disabled={loadingId === contract.id}
													className="rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60">
													{t("cancelContract")}
												</button>
											)}
											{role === "buyer" && !contract.deliveryConfirmedAt && (
												<button
													onClick={() => onRequestDeliveryConfirm(contract.id)}
													disabled={loadingId === contract.id}
													className="flex items-center gap-1 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#16A34A] transition-colors hover:bg-[#DCFCE7] disabled:opacity-60">
													<PackageCheck size={14} />
													{t("confirmDeliveryTitle")}
												</button>
											)}
											{contract.deliveryConfirmedAt && (
												<span className="flex items-center gap-1 text-xs font-medium whitespace-nowrap text-[#16A34A]">
													<PackageCheck size={14} />
													{t("deliveryConfirmedTitle", {
														date: new Date(contract.deliveryConfirmedAt).toLocaleDateString(
															locale,
														),
													})}
												</span>
											)}
										</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
