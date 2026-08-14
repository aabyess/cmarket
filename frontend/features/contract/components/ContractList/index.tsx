"use client";

import { useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { FileCheck, Building2, Calendar, DollarSign, Upload, CheckCircle2, Clock, FileText, Truck } from "lucide-react";
import { cn } from "@/utils/cn";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ContractListTabs } from "@/features/contract/components/ContractList/ContractListTabs";
import type { Contract, ContractFilter, ContractStatus } from "@/features/contract/types";

const CURRENCY_SYMBOL: Record<string, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_LABEL: Record<ContractStatus, string> = {
	ongoing: "진행 중",
	completed: "납품 완료",
	cancelled: "취소됨",
};

const STATUS_STYLE: Record<ContractStatus, string> = {
	ongoing: "bg-[#EFF6FF] text-[#3B82F6]",
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
	const router = useRouter();
	const [filter, setFilter] = useState<ContractFilter>("all");
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [uploadingId, setUploadingId] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
	const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

	async function handleStatusChange(contractId: string, status: "completed" | "cancelled") {
		setLoadingId(contractId);
		try {
			const res = await fetch("/api/contract/status", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ contractId, status }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert("처리 중 오류가 발생했습니다.");
		} finally {
			setLoadingId(null);
			setConfirmId(null);
			setCancelConfirmId(null);
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
			alert("영수증 업로드 중 오류가 발생했습니다.");
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
			alert("영수증을 불러오는 중 오류가 발생했습니다.");
		}
	}

	const counts: Record<ContractFilter, number> = {
		all: contracts.length,
		ongoing: contracts.filter((c) => c.status === "ongoing").length,
		completed: contracts.filter((c) => c.status === "completed").length,
	};

	const visibleContracts =
		filter === "all"
			? [...contracts].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
			: contracts.filter((c) => c.status === filter);

	if (contracts.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<FileCheck size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-base font-medium text-[#1F2937]">계약이 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">계약 확정 후 계약이 생성됩니다.</p>
			</div>
		);
	}

	return (
		<>
			<ContractListTabs value={filter} counts={counts} onChange={setFilter} />

			{visibleContracts.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<p className="text-sm text-[#6B7280]">
						{filter === "ongoing" ? "진행 중인 계약이 없어요." : "완료된 계약이 없어요."}
					</p>
				</div>
			) : (
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{visibleContracts.map((contract) => (
					<div
						key={contract.id}
						className={cn(
							"rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-opacity",
							contract.status !== "ongoing" && "opacity-75",
						)}
					>
						{/* 헤더 */}
						<div className="mb-4 flex items-start justify-between gap-4">
							<div>
								<p className="text-base font-semibold text-[#1F2937]">
									{contract.listing.title}
								</p>
								<p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
									<Building2 size={13} />
									{contract.partnerCompanyName || "기업명 없음"}
								</p>
							</div>
							<span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[contract.status])}>
								{STATUS_LABEL[contract.status]}
							</span>
						</div>

						{/* 메타 정보 */}
						<div className="mb-4 flex flex-wrap gap-4 text-xs text-[#6B7280]">
							<span className="flex items-center gap-1.5">
								<DollarSign size={13} />
								{CURRENCY_SYMBOL[contract.quote.currency]} {contract.quote.price.toLocaleString()}
							</span>
							<span className="flex items-center gap-1.5">
								<Truck size={13} />
								납기 {contract.quote.deliveryDays}일
							</span>
							<span className="flex items-center gap-1.5">
								<Calendar size={13} />
								{new Date(contract.createdAt).toLocaleDateString("ko-KR")} 계약
							</span>
						</div>

						{/* 상태 배너 */}
						{contract.paymentConfirmedAt && (
							<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F0FDF4] px-3.5 py-2.5 text-xs font-medium text-[#16A34A]">
								<CheckCircle2 size={14} />
								입금 확인 완료 · {new Date(contract.paymentConfirmedAt).toLocaleDateString("ko-KR")}
							</div>
						)}

						{/* Buyer: 영수증 업로드 대기 배너 */}
						{role === "buyer" && contract.paymentReceiptUrl && !contract.paymentConfirmedAt && (
							<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#EFF6FF] px-3.5 py-2.5 text-xs font-medium text-[#3B82F6]">
								<CheckCircle2 size={14} />
								영수증 업로드 완료 · 공급기업 확인 대기 중
							</div>
						)}

						{/* Seller: 영수증 도착 배너 */}
						{role === "seller" && contract.paymentReceiptUrl && !contract.paymentConfirmedAt && (
							<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#FFFBEB] px-3.5 py-2.5 text-xs font-medium text-[#D97706]">
								<FileText size={14} />
								송금 영수증 도착 · 확인 후 입금 처리해주세요
							</div>
						)}

						{/* Seller: 영수증 없을 때 안내 */}
						{role === "seller" && !contract.paymentReceiptUrl && contract.status === "ongoing" && !contract.paymentConfirmedAt && (
							<div className="mb-4 flex items-center gap-2 rounded-xl bg-[#F9FAFB] px-3.5 py-2.5 text-xs text-[#9CA3AF]">
								<Clock size={14} />
								바이어의 송금 영수증을 기다리는 중
							</div>
						)}

						{/* 액션 버튼 */}
						{contract.status === "ongoing" && (
							<div className="flex flex-wrap gap-2">
								{/* Buyer 버튼 */}
								{role === "buyer" && (
									<>
										<input
											ref={(el) => { fileInputRefs.current[contract.id] = el; }}
											type="file"
											accept="image/*,.pdf"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) handleReceiptUpload(contract.id, file);
											}}
										/>
										{contract.paymentReceiptUrl ? (
											<>
												<button
													onClick={() => handleViewReceipt(contract.id)}
													className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] py-2.5 text-xs font-medium text-[#3B82F6] transition-colors hover:bg-[#DBEAFE]"
												>
													<FileText size={14} />
													영수증 보기
												</button>
												<button
													onClick={() => fileInputRefs.current[contract.id]?.click()}
													disabled={uploadingId === contract.id}
													className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5E7EB] py-2.5 text-xs font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60"
												>
													<Upload size={14} />
													{uploadingId === contract.id ? "업로드 중..." : "재업로드"}
												</button>
											</>
										) : (
											<button
												onClick={() => fileInputRefs.current[contract.id]?.click()}
												disabled={uploadingId === contract.id}
												className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#3B82F6] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60"
											>
												<Upload size={14} />
												{uploadingId === contract.id ? "업로드 중..." : "송금 영수증 업로드"}
											</button>
										)}
										<button
											onClick={() => setCancelConfirmId(contract.id)}
											disabled={loadingId === contract.id}
											className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60"
										>
											계약 취소
										</button>
									</>
								)}

								{/* Seller 버튼 */}
								{role === "seller" && (
									<>
										{contract.paymentReceiptUrl && (
											<button
												onClick={() => handleViewReceipt(contract.id)}
												className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] py-2.5 text-xs font-medium text-[#3B82F6] transition-colors hover:bg-[#DBEAFE]"
											>
												<FileText size={14} />
												영수증 확인
											</button>
										)}
										<button
											onClick={() => setConfirmId(contract.id)}
											disabled={loadingId === contract.id}
											className={cn(
												"flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors disabled:opacity-60",
												contract.paymentReceiptUrl
													? "bg-[#16A34A] text-white hover:bg-[#15803D]"
													: "border border-[#E5E7EB] bg-white text-[#9CA3AF]",
											)}
										>
											<CheckCircle2 size={14} />
											{loadingId === contract.id ? "처리 중..." : "입금 확인"}
										</button>
										<button
											onClick={() => setCancelConfirmId(contract.id)}
											disabled={loadingId === contract.id}
											className="flex-1 rounded-xl border border-[#E5E7EB] py-2.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60"
										>
											계약 취소
										</button>
									</>
								)}
							</div>
						)}
					</div>
				))}
			</div>
			)}

			<ConfirmModal
				isOpen={confirmId !== null}
				title="입금 확인하시겠습니까?"
				description="확인 후 계약이 완료 처리됩니다. 실제 입금 여부를 확인 후 진행해주세요."
				confirmLabel="입금 확인"
				variant="default"
				isLoading={loadingId === confirmId}
				onConfirm={() => confirmId && handleStatusChange(confirmId, "completed")}
				onClose={() => setConfirmId(null)}
			/>

			<ConfirmModal
				isOpen={cancelConfirmId !== null}
				title="계약을 취소하시겠습니까?"
				description="취소 후에는 되돌릴 수 없습니다."
				confirmLabel="취소 확정"
				variant="danger"
				isLoading={loadingId === cancelConfirmId}
				onConfirm={() => cancelConfirmId && handleStatusChange(cancelConfirmId, "cancelled")}
				onClose={() => setCancelConfirmId(null)}
			/>
		</>
	);
}