"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
	CheckCircle2,
	FileText,
	RotateCcw,
	Upload,
	PackageCheck,
	Star,
	Trash2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { ActionButton, actionButtonVariants } from "@/components/ui/ActionButton";
import type { Contract, ContractStatus } from "@/features/contract/types";
import type { MyReview } from "@/features/reviews/types";

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
	myReviewMap: Map<string, MyReview>;
	onUploadClick: (contractId: string) => void;
	onViewReceipt: (contractId: string) => void;
	onRequestConfirm: (contractId: string) => void;
	onRequestCancel: (contractId: string) => void;
	onRequestDeliveryConfirm: (contractId: string) => void;
	onRequestReceiptDelete: (contractId: string) => void;
	onRequestReview: (contractId: string) => void;
	onOpenDetail: (listingId: string) => void;
};

export function ContractListTable({
	contracts,
	role,
	loadingId,
	uploadingId,
	myReviewMap,
	onUploadClick,
	onViewReceipt,
	onRequestConfirm,
	onRequestCancel,
	onRequestDeliveryConfirm,
	onRequestReceiptDelete,
	onRequestReview,
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
		<div className="border-hairline overflow-hidden rounded-2xl border bg-white">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-hairline text-subtle border-b bg-[#F9FAFB] text-left text-xs font-medium">
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
									<motion.span
										layoutId={`contract-status-${contract.id}`}
										transition={{ type: "spring", stiffness: 300, damping: 30 }}
										className={cn(
											"rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
											STATUS_STYLE[contract.status],
										)}>
										{statusLabels[contract.status]}
									</motion.span>
								</td>
								<td className="text-ink max-w-[200px] truncate px-4 py-3 font-medium">
									{contract.listing.title}
								</td>
								<td className="text-muted max-w-[160px] truncate px-4 py-3">
									{contract.partnerCompanyName || t("noPartnerCompanyName")}
								</td>
								<td className="text-ink px-4 py-3">
									{CURRENCY_SYMBOL[contract.quote.currency]} {contract.quote.price.toLocaleString()}
								</td>
								<td className="text-muted px-4 py-3">
									{t("days", { count: contract.quote.deliveryDays })}
								</td>
								<td className="text-subtle px-4 py-3">
									{new Date(contract.createdAt).toLocaleDateString(locale)}
								</td>
								{/* 액션 칸 — 버튼 클릭이 행 이동으로 번지지 않게 막는다.
								    폭을 고정하고 버튼을 세로로 쌓아(w-full) 행마다 조합이 달라도
								    시작 위치·크기가 흔들리지 않게 한다. 상태 표기(수령확인완료/평가완료)는
								    버튼과 분리해 조용한 텍스트로만 보여준다. */}
								<td className="w-44 px-4 py-3 align-top" onClick={(e) => e.stopPropagation()}>
									{contract.status === "cancelled" ? (
										<span className="text-subtle block text-right text-xs">-</span>
									) : (
										<div className="flex flex-col items-stretch gap-2">
											{(contract.deliveryConfirmedAt ||
												(contract.paymentConfirmedAt && myReviewMap.has(contract.id))) && (
												<div className="flex flex-col items-stretch gap-1.5">
													{/* 버튼과 같은 폭·높이의 연한 배지로 맞춰 칸 전체가 한 덩어리로 정렬되게 한다. */}
													{contract.deliveryConfirmedAt && (
														<span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#F0FDF4] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#16A34A]">
															<PackageCheck size={14} />
															{/* 좁은 액션 칸에서 날짜까지 넣으면 두 줄로 깨져서 테이블에선 라벨만 보여준다(카드 뷰는 날짜 유지). */}
															{t("deliveryConfirmedTitle")}
														</span>
													)}
													{contract.paymentConfirmedAt && myReviewMap.has(contract.id) && (
														<span className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FFFBEB] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#D97706]">
															<Star size={14} className="fill-[#D97706]" />
															{t("reviewedBadge", {
																rating: myReviewMap.get(contract.id)?.rating ?? 0,
															})}
														</span>
													)}
												</div>
											)}

											<div className="flex flex-col gap-1.5">
												{/* 주요 행동 */}
												{role === "buyer" && !contract.deliveryConfirmedAt && (
													<ActionButton
														onClick={() => onRequestDeliveryConfirm(contract.id)}
														disabled={loadingId === contract.id}
														tone="primary">
														<PackageCheck size={14} />
														{t("confirmDeliveryTitle")}
													</ActionButton>
												)}
												{contract.status === "ongoing" && role === "buyer" && (
													<ActionButton
														onClick={() => onUploadClick(contract.id)}
														disabled={uploadingId === contract.id}
														tone="primary">
														<Upload size={14} />
														{contract.paymentReceiptUrl
															? t("reuploadReceiptTitle")
															: t("uploadReceiptTitle")}
													</ActionButton>
												)}
												{contract.status === "ongoing" && role === "seller" && (
													<ActionButton
														onClick={() => onRequestConfirm(contract.id)}
														disabled={loadingId === contract.id || !contract.paymentReceiptUrl}
														tone={contract.paymentReceiptUrl ? "primary" : "primaryDisabled"}>
														<CheckCircle2 size={14} />
														{t("confirmPaymentTitle")}
													</ActionButton>
												)}

												{/* 보조 행동 */}
												{contract.status === "ongoing" && contract.paymentReceiptUrl && (
													<ActionButton onClick={() => onViewReceipt(contract.id)} tone="secondary">
														<FileText size={14} />
														{role === "seller" ? t("confirmReceiptTitle") : t("viewReceiptTitle")}
													</ActionButton>
												)}
												{contract.status === "ongoing" &&
													role === "buyer" &&
													contract.paymentReceiptUrl && (
														<ActionButton
															onClick={() => onRequestReceiptDelete(contract.id)}
															disabled={loadingId === contract.id}
															tone="danger">
															<Trash2 size={14} />
															{t("deleteReceiptTitle")}
														</ActionButton>
													)}
												{contract.paymentConfirmedAt && !myReviewMap.has(contract.id) && (
													<ActionButton
														onClick={() => onRequestReview(contract.id)}
														tone="secondaryNeutral">
														<Star size={14} />
														{t("reviewButton")}
													</ActionButton>
												)}
												{contract.status === "completed" && role === "buyer" && (
													<Link
														href={`/buyer/listing/${contract.listingId}/duplicate`}
														className={actionButtonVariants({ tone: "secondary" })}>
														<RotateCcw size={14} />
														{t("reorderButton")}
													</Link>
												)}

												{/* 위험 행동 — 계약 자체를 끝내는 조작이라 가장 눈에 덜 띄게 둔다 */}
												{contract.status === "ongoing" && !contract.paymentReceiptUrl && (
													<ActionButton
														onClick={() => onRequestCancel(contract.id)}
														disabled={loadingId === contract.id}
														tone="dangerGhost">
														{t("cancelContract")}
													</ActionButton>
												)}
											</div>
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
