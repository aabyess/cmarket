"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { CheckCircle2, FileText, Upload, PackageCheck, Star, Trash2 } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";
import type { Contract, ContractStatus } from "@/features/contract/types";
import type { MyReview } from "@/features/reviews/types";

// 행동 버튼의 3단계 위계 — 주요(굵은 색상) → 보조(옅은 테두리) → 위험(계약 취소,
// 텍스트만 남겨 시각적으로 가장 약하게). 모든 행에서 버튼이 같은 스타일 규칙을
// 따르게 해 조합이 달라도 시작 위치·크기가 흔들리지 않도록 한다.
const actionButton = cva(
	"flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60",
	{
		variants: {
			tone: {
				primary: "bg-[#16A34A] text-white hover:bg-[#15803D]",
				primaryDisabled: "border border-[#E5E7EB] text-[#9CA3AF]",
				secondary: "text-imsg-blue border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-[#DBEAFE]",
				secondaryNeutral: "border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]",
				danger: "border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]",
				dangerGhost: "text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#DC2626]",
			},
		},
	},
);

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
								{/* 액션 칸 — 버튼 클릭이 행 이동으로 번지지 않게 막는다.
								    폭을 고정하고 버튼을 세로로 쌓아(w-full) 행마다 조합이 달라도
								    시작 위치·크기가 흔들리지 않게 한다. 상태 표기(수령확인완료/평가완료)는
								    버튼과 분리해 조용한 텍스트로만 보여준다. */}
								<td className="w-44 px-4 py-3 align-top" onClick={(e) => e.stopPropagation()}>
									{contract.status === "cancelled" ? (
										<span className="block text-right text-xs text-[#9CA3AF]">-</span>
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
													<button
														onClick={() => onRequestDeliveryConfirm(contract.id)}
														disabled={loadingId === contract.id}
														className={actionButton({ tone: "primary" })}>
														<PackageCheck size={14} />
														{t("confirmDeliveryTitle")}
													</button>
												)}
												{contract.status === "ongoing" && role === "buyer" && (
													<button
														onClick={() => onUploadClick(contract.id)}
														disabled={uploadingId === contract.id}
														className={actionButton({ tone: "primary" })}>
														<Upload size={14} />
														{contract.paymentReceiptUrl
															? t("reuploadReceiptTitle")
															: t("uploadReceiptTitle")}
													</button>
												)}
												{contract.status === "ongoing" && role === "seller" && (
													<button
														onClick={() => onRequestConfirm(contract.id)}
														disabled={loadingId === contract.id || !contract.paymentReceiptUrl}
														className={actionButton({
															tone: contract.paymentReceiptUrl ? "primary" : "primaryDisabled",
														})}>
														<CheckCircle2 size={14} />
														{t("confirmPaymentTitle")}
													</button>
												)}

												{/* 보조 행동 */}
												{contract.status === "ongoing" && contract.paymentReceiptUrl && (
													<button
														onClick={() => onViewReceipt(contract.id)}
														className={actionButton({ tone: "secondary" })}>
														<FileText size={14} />
														{role === "seller" ? t("confirmReceiptTitle") : t("viewReceiptTitle")}
													</button>
												)}
												{contract.status === "ongoing" && role === "buyer" && contract.paymentReceiptUrl && (
													<button
														onClick={() => onRequestReceiptDelete(contract.id)}
														disabled={loadingId === contract.id}
														className={actionButton({ tone: "danger" })}>
														<Trash2 size={14} />
														{t("deleteReceiptTitle")}
													</button>
												)}
												{contract.paymentConfirmedAt && !myReviewMap.has(contract.id) && (
													<button
														onClick={() => onRequestReview(contract.id)}
														className={actionButton({ tone: "secondaryNeutral" })}>
														<Star size={14} />
														{t("reviewButton")}
													</button>
												)}

												{/* 위험 행동 — 계약 자체를 끝내는 조작이라 가장 눈에 덜 띄게 둔다 */}
												{contract.status === "ongoing" && !contract.paymentReceiptUrl && (
													<button
														onClick={() => onRequestCancel(contract.id)}
														disabled={loadingId === contract.id}
														className={actionButton({ tone: "dangerGhost" })}>
														{t("cancelContract")}
													</button>
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
