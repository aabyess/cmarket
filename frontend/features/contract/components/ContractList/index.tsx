"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@/i18n/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
	FileCheck,
	Building2,
	Calendar,
	DollarSign,
	Upload,
	CheckCircle2,
	Clock,
	FileText,
	RotateCcw,
	Star,
	Truck,
	PackageCheck,
	Trash2,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { actionButtonVariants } from "@/components/ui/ActionButton";
import { Pagination } from "@/components/commons/Pagination";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import { useFilterPresets } from "@/hooks/useFilterPresets";
import {
	ContractListTabs,
	type ContractListFilterPresetValue,
} from "@/features/contract/components/ContractList/ContractListTabs";
import { ContractListTable } from "@/features/contract/components/ContractList/ContractListTable";
import { ContractListCancelModal } from "@/features/contract/components/ContractList/ContractListCancelModal";
import { ReviewModal } from "@/features/reviews/components/ReviewModal";
import { REVIEWS_QUERY_KEYS, useMyReviews } from "@/features/reviews/queries";
import { submitReview } from "@/features/reviews/mutations";
import type { Contract, ContractFilter, ContractStatus } from "@/features/contract/types";

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

type ContractListProps = {
	contracts: Contract[];
	role: "buyer" | "seller";
};

/** 전체 탭에서는 손이 가야 하는 계약이 먼저 와야 한다. 취소된 계약은 맨 뒤로 보낸다. */
const STATUS_ORDER: Record<ContractStatus, number> = {
	ongoing: 0,
	completed: 1,
	cancelled: 2,
};

export function ContractList({ contracts, role }: ContractListProps) {
	const t = useTranslations("ContractList");
	const locale = useLocale();
	const router = useRouter();
	const queryClient = useQueryClient();
	const statusLabels: Record<ContractStatus, string> = {
		ongoing: t("statusOngoing"),
		completed: t("statusCompleted"),
		cancelled: t("statusCancelled"),
	};
	const [filter, setFilter] = useState<ContractFilter>("all");
	const [search, setSearch] = useState("");
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [uploadingId, setUploadingId] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
	const [deliveryConfirmId, setDeliveryConfirmId] = useState<string | null>(null);
	const [receiptDeleteId, setReceiptDeleteId] = useState<string | null>(null);
	const [reviewContractId, setReviewContractId] = useState<string | null>(null);
	const [isSubmittingReview, setIsSubmittingReview] = useState(false);
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [page, setPage] = useState(1);
	const {
		presets: filterPresets,
		savePreset,
		deletePreset,
	} = useFilterPresets<ContractListFilterPresetValue>(`mitrapay:contract-list-presets-${role}`);

	function applyFilterPreset(value: ContractListFilterPresetValue): void {
		setFilter(value.filter);
		setSearch(value.search);
	}

	function saveFilterPreset(name: string): void {
		savePreset(name, { filter, search });
	}
	const [pageSize, setPageSize] = useState(10);
	const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

	const contractIds = contracts.map((contract) => contract.id);
	const { data: myReviews = [] } = useMyReviews(contractIds);
	const myReviewMap = new Map(myReviews.map((review) => [review.contractId, review]));

	async function handleSubmitReview(rating: number, comment: string): Promise<void> {
		if (!reviewContractId) return;
		setIsSubmittingReview(true);
		try {
			await submitReview({ contractId: reviewContractId, rating, comment: comment || undefined });
			queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEYS.myReviews(contractIds) });
			setReviewContractId(null);
		} catch (err) {
			console.error(err);
			alert(t("reviewErrorMessage"));
		} finally {
			setIsSubmittingReview(false);
		}
	}

	function handleUploadClick(contractId: string) {
		fileInputRefs.current[contractId]?.click();
	}

	/** 계약이 어떤 공고에서 나온 것인지 확인할 수 있도록 상세 페이지로 이동한다. */
	function handleOpenDetail(listingId: string) {
		router.push(
			role === "buyer" ? `/buyer/listing/${listingId}` : `/seller/listing-browse/${listingId}`,
		);
	}

	async function handleStatusChange(
		contractId: string,
		status: "completed" | "cancelled",
		reason?: string,
	) {
		setLoadingId(contractId);
		try {
			const res = await fetch("/api/contract/status", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contractId, status, reason }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("genericErrorMessage"));
		} finally {
			setLoadingId(null);
			setConfirmId(null);
			setCancelConfirmId(null);
		}
	}

	async function handleDeliveryConfirm(contractId: string) {
		setLoadingId(contractId);
		try {
			const res = await fetch("/api/contract/confirm-delivery", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contractId }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("genericErrorMessage"));
		} finally {
			setLoadingId(null);
			setDeliveryConfirmId(null);
		}
	}

	async function handleReceiptDelete(contractId: string) {
		setLoadingId(contractId);
		try {
			const res = await fetch("/api/contract/receipt", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contractId }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("receiptDeleteErrorMessage"));
		} finally {
			setLoadingId(null);
			setReceiptDeleteId(null);
		}
	}

	async function handleReceiptUpload(contractId: string, file: File) {
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

	async function handleViewReceipt(contractId: string) {
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

	const counts: Record<ContractFilter, number> = {
		all: contracts.length,
		ongoing: contracts.filter((c) => c.status === "ongoing").length,
		completed: contracts.filter((c) => c.status === "completed").length,
		cancelled: contracts.filter((c) => c.status === "cancelled").length,
	};

	const keyword = search.trim().toLowerCase();
	const visibleContracts = (
		filter === "all"
			? [...contracts].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
			: contracts.filter((c) => c.status === filter)
	).filter((c) => {
		if (!keyword) return true;
		return (
			c.listing.title.toLowerCase().includes(keyword) ||
			c.partnerCompanyName.toLowerCase().includes(keyword)
		);
	});

	useEffect(() => {
		setPage(1);
	}, [filter, search, pageSize]);

	const pageCount = Math.max(1, Math.ceil(visibleContracts.length / pageSize));
	const paginatedContracts = visibleContracts.slice((page - 1) * pageSize, page * pageSize);

	if (contracts.length === 0) {
		return (
			<div className="border-hairline rounded-2xl border bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<FileCheck size={26} className="text-subtle" />
				</div>
				<p className="text-ink text-base font-medium">{t("emptyTitle")}</p>
				<p className="text-muted mt-1 text-sm">{t("emptyDescription")}</p>
			</div>
		);
	}

	return (
		<>
			<div className="mb-4 flex items-center justify-between gap-2">
				<ContractListTabs
					value={filter}
					counts={counts}
					onChange={setFilter}
					search={search}
					onSearchChange={setSearch}
					filterPresets={filterPresets}
					onApplyFilterPreset={applyFilterPreset}
					onSaveFilterPreset={saveFilterPreset}
					onDeleteFilterPreset={deletePreset}
				/>
				<ViewModeToggle value={viewMode} onChange={setViewMode} />
			</div>

			{/* 영수증 업로드용 파일 인풋. 카드/테이블 어느 뷰에서도 열 수 있도록 뷰와 무관하게 둔다. */}
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
				<div className="border-hairline rounded-2xl border bg-white p-12 text-center">
					<p className="text-muted text-sm">
						{filter === "ongoing"
							? t("noResultsOngoing")
							: filter === "cancelled"
								? t("noResultsCancelled")
								: t("noResultsCompleted")}
					</p>
				</div>
			) : (
				// 그리드↔테이블 전환 시 상태 배지가 이전 위치에서 새 위치로 이동하는 느낌을
				// 주기 위해 같은 layoutId를 공유한다(#161과 동일 패턴).
				<LayoutGroup id="contract-list">
					<AnimatePresence mode="popLayout" initial={false}>
						{viewMode === "list" ? (
							<motion.div
								key="table"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}>
								<ContractListTable
									contracts={paginatedContracts}
									role={role}
									loadingId={loadingId}
									uploadingId={uploadingId}
									myReviewMap={myReviewMap}
									onUploadClick={handleUploadClick}
									onViewReceipt={handleViewReceipt}
									onRequestConfirm={setConfirmId}
									onRequestCancel={setCancelConfirmId}
									onRequestDeliveryConfirm={setDeliveryConfirmId}
									onRequestReceiptDelete={setReceiptDeleteId}
									onRequestReview={setReviewContractId}
									onOpenDetail={handleOpenDetail}
								/>
							</motion.div>
						) : (
							<motion.div
								key="grid"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="grid grid-cols-1 gap-4 lg:grid-cols-2">
								{paginatedContracts.map((contract) => (
						<div
							key={contract.id}
							onClick={() => handleOpenDetail(contract.listingId)}
							className={cn(
								"cursor-pointer rounded-2xl border border-hairline bg-white p-6 transition-all hover:border-[#BFDBFE] hover:shadow-sm",
								contract.status !== "ongoing" && "opacity-75",
							)}>
							{/* 헤더 */}
							<div className="mb-4 flex items-start justify-between gap-4">
								<div>
									<p className="text-base font-semibold text-ink">{contract.listing.title}</p>
									<p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
										<Building2 size={13} />
										{contract.partnerCompanyName || t("noPartnerCompanyName")}
									</p>
								</div>
								<motion.span
									layoutId={`contract-status-${contract.id}`}
									transition={{ type: "spring", stiffness: 300, damping: 30 }}
									className={cn(
										"shrink-0 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap",
										STATUS_STYLE[contract.status],
									)}>
									{statusLabels[contract.status]}
								</motion.span>
							</div>

							{/* 메타 정보 */}
							<div className="mb-4 flex flex-wrap gap-4 text-xs text-muted">
								<span className="flex items-center gap-1.5">
									<DollarSign size={13} />
									{CURRENCY_SYMBOL[contract.quote.currency]} {contract.quote.price.toLocaleString()}
								</span>
								<span className="flex items-center gap-1.5">
									<Truck size={13} />
									{t("deliveryDaysLabel", { days: contract.quote.deliveryDays })}
								</span>
								<span className="flex items-center gap-1.5">
									<Calendar size={13} />
									{t("contractedOn", {
										date: new Date(contract.createdAt).toLocaleDateString(locale),
									})}
								</span>
							</div>

							{/* 상태 배너 */}
							{contract.paymentConfirmedAt && (
								<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F0FDF4] px-3.5 py-2.5 text-xs font-medium text-[#16A34A]">
									<CheckCircle2 size={14} />
									{t("paymentConfirmed", {
										date: new Date(contract.paymentConfirmedAt).toLocaleDateString(locale),
									})}
								</div>
							)}

							{/* 물품 수령 확인 완료 배너 */}
							{contract.deliveryConfirmedAt && (
								<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F0FDF4] px-3.5 py-2.5 text-xs font-medium text-[#16A34A]">
									<PackageCheck size={14} />
									{t("deliveryConfirmed", {
										date: new Date(contract.deliveryConfirmedAt).toLocaleDateString(locale),
									})}
								</div>
							)}

							{/* 평가하기 — 결제 확인된 거래에서만 가능 */}
							{contract.paymentConfirmedAt && (
								<div className="mb-4" onClick={(e) => e.stopPropagation()}>
									{myReviewMap.has(contract.id) ? (
										<span className="flex items-center justify-center gap-1 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] py-2.5 text-xs font-medium text-[#D97706]">
											<Star size={14} className="fill-[#D97706]" />
											{t("reviewedBadge", { rating: myReviewMap.get(contract.id)?.rating ?? 0 })}
										</span>
									) : (
										<button
											onClick={() => setReviewContractId(contract.id)}
											className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-hairline py-2.5 text-xs font-medium text-[#374151] transition-colors hover:bg-imsg-surface">
											<Star size={14} />
											{t("reviewButton")}
										</button>
									)}
								</div>
							)}

							{/* 다시 발주하기 — 완료된 계약의 원본 공고를 복제하는 것과 동일해서
							    기존 공고 복제 라우트로 링크만 건다(별도 로직 없음). */}
							{contract.status === "completed" && role === "buyer" && (
								<div className="mb-4" onClick={(e) => e.stopPropagation()}>
									<Link
										href={`/buyer/listing/${contract.listingId}/duplicate`}
										className={actionButtonVariants({ tone: "secondary", size: "md" })}>
										<RotateCcw size={14} />
										{t("reorderButton")}
									</Link>
								</div>
							)}

							{/* Buyer: 영수증 업로드 대기 배너 */}
							{role === "buyer" && contract.paymentReceiptUrl && !contract.paymentConfirmedAt && (
								<div className="text-imsg-blue mb-4 flex items-center gap-2 rounded-xl bg-[#EFF6FF] px-3.5 py-2.5 text-xs font-medium">
									<CheckCircle2 size={14} />
									{t("receiptUploadedWaiting")}
								</div>
							)}

							{/* Seller: 영수증 도착 배너 */}
							{role === "seller" && contract.paymentReceiptUrl && !contract.paymentConfirmedAt && (
								<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#FFFBEB] px-3.5 py-2.5 text-xs font-medium text-[#D97706]">
									<FileText size={14} />
									{t("receiptArrived")}
								</div>
							)}

							{/* Seller: 영수증 없을 때 안내 */}
							{role === "seller" &&
								!contract.paymentReceiptUrl &&
								contract.status === "ongoing" &&
								!contract.paymentConfirmedAt && (
									<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F9FAFB] px-3.5 py-2.5 text-xs text-subtle">
										<Clock size={14} />
										{t("waitingForReceipt")}
									</div>
								)}

							{/* 액션 버튼 — 클릭이 카드 이동으로 번지지 않게 막는다 */}
							{contract.status === "ongoing" && (
								<div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
									{/* Buyer 버튼 */}
									{role === "buyer" && (
										<>
											{contract.paymentReceiptUrl ? (
												<>
													<button
														onClick={() => handleViewReceipt(contract.id)}
														className="text-imsg-blue flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] py-2.5 text-xs font-medium transition-colors hover:bg-[#DBEAFE]">
														<FileText size={14} />
														{t("viewReceipt")}
													</button>
													<button
														onClick={() => fileInputRefs.current[contract.id]?.click()}
														disabled={uploadingId === contract.id}
														className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hairline py-2.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60">
														<Upload size={14} />
														{uploadingId === contract.id ? t("uploading") : t("reupload")}
													</button>
													<button
														onClick={() => setReceiptDeleteId(contract.id)}
														disabled={loadingId === contract.id}
														className="flex items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEE2E2] disabled:opacity-60">
														<Trash2 size={14} />
														{t("deleteReceipt")}
													</button>
												</>
											) : (
												<button
													onClick={() => fileInputRefs.current[contract.id]?.click()}
													disabled={uploadingId === contract.id}
													className="bg-imsg-blue flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
													<Upload size={14} />
													{uploadingId === contract.id ? t("uploading") : t("uploadReceipt")}
												</button>
											)}
											{!contract.paymentReceiptUrl && (
												<button
													onClick={() => setCancelConfirmId(contract.id)}
													disabled={loadingId === contract.id}
													className="flex-1 rounded-xl border border-hairline py-2.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60">
													{t("cancelContract")}
												</button>
											)}
										</>
									)}

									{/* Seller 버튼 */}
									{role === "seller" && (
										<>
											{contract.paymentReceiptUrl && (
												<button
													onClick={() => handleViewReceipt(contract.id)}
													className="text-imsg-blue flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] py-2.5 text-xs font-medium transition-colors hover:bg-[#DBEAFE]">
													<FileText size={14} />
													{t("confirmReceipt")}
												</button>
											)}
											<button
												onClick={() => setConfirmId(contract.id)}
												disabled={loadingId === contract.id || !contract.paymentReceiptUrl}
												className={cn(
													"flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors disabled:opacity-60",
													contract.paymentReceiptUrl
														? "bg-[#16A34A] text-white hover:bg-[#15803D]"
														: "border border-hairline bg-white text-subtle",
												)}>
												<CheckCircle2 size={14} />
												{loadingId === contract.id ? t("processing") : t("confirmPayment")}
											</button>
											{!contract.paymentReceiptUrl && (
												<button
													onClick={() => setCancelConfirmId(contract.id)}
													disabled={loadingId === contract.id}
													className="flex-1 rounded-xl border border-hairline py-2.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60">
													{t("cancelContract")}
												</button>
											)}
										</>
									)}
								</div>
							)}

							{/* Buyer: 물품 수령 확인 (BAST) — 취소된 계약이 아니면 언제든 1회 가능 */}
							{role === "buyer" &&
								contract.status !== "cancelled" &&
								!contract.deliveryConfirmedAt && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											setDeliveryConfirmId(contract.id);
										}}
										disabled={loadingId === contract.id}
										className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] py-2.5 text-xs font-semibold text-[#16A34A] transition-colors hover:bg-[#DCFCE7] disabled:opacity-60">
										<PackageCheck size={14} />
										{loadingId === contract.id ? t("processing") : t("confirmDelivery")}
									</button>
								)}
						</div>
					))}
							</motion.div>
						)}
					</AnimatePresence>
				</LayoutGroup>
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
				confirmLabel={t("confirmPayment")}
				variant="default"
				isLoading={loadingId === confirmId}
				onConfirm={() => confirmId && handleStatusChange(confirmId, "completed")}
				onClose={() => setConfirmId(null)}
			/>

			<ConfirmModal
				isOpen={deliveryConfirmId !== null}
				title={t("confirmDeliveryModalTitle")}
				description={t("confirmDeliveryModalDescription")}
				confirmLabel={t("confirmDelivery")}
				variant="default"
				isLoading={loadingId === deliveryConfirmId}
				onConfirm={() => deliveryConfirmId && handleDeliveryConfirm(deliveryConfirmId)}
				onClose={() => setDeliveryConfirmId(null)}
			/>

			<ConfirmModal
				isOpen={receiptDeleteId !== null}
				title={t("deleteReceiptModalTitle")}
				description={t("deleteReceiptModalDescription")}
				confirmLabel={t("deleteReceipt")}
				variant="danger"
				isLoading={loadingId === receiptDeleteId}
				onConfirm={() => receiptDeleteId && handleReceiptDelete(receiptDeleteId)}
				onClose={() => setReceiptDeleteId(null)}
			/>

			<ContractListCancelModal
				isOpen={cancelConfirmId !== null}
				isLoading={loadingId === cancelConfirmId}
				onConfirm={(reason) =>
					cancelConfirmId && handleStatusChange(cancelConfirmId, "cancelled", reason)
				}
				onClose={() => setCancelConfirmId(null)}
			/>

			<ReviewModal
				isOpen={reviewContractId !== null}
				isLoading={isSubmittingReview}
				onSubmit={handleSubmitReview}
				onClose={() => setReviewContractId(null)}
			/>
		</>
	);
}
