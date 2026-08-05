"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, Building2, Calendar, Package } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Contract, ContractStatus } from "@/features/contract/types";

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

export function ContractList({ contracts, role }: ContractListProps) {
	const router = useRouter();
	const [loadingId, setLoadingId] = useState<string | null>(null);

	async function handleStatusChange(contractId: string, status: "completed" | "cancelled") {
		const label = status === "completed" ? "납품 완료" : "계약 취소";
		if (!confirm(`${label} 처리하시겠습니까?`)) return;

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
		}
	}

	if (contracts.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
					<FileCheck size={26} className="text-[#9CA3AF]" />
				</div>
				<p className="text-[17px] font-medium text-[#1F2937]">계약이 없어요</p>
				<p className="mt-1 text-sm text-[#6B7280]">낙찰 확정 후 계약이 생성됩니다.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{contracts.map((contract) => (
				<div
					key={contract.id}
					className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
				>
					<div className="mb-4 flex items-start justify-between">
						<div>
							<p className="text-[17px] font-semibold text-[#1F2937]">
								{contract.listing.title}
							</p>
							<p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B7280]">
								<Building2 size={14} />
								{contract.partnerCompanyName || "기업명 없음"}
							</p>
						</div>
						<span className={cn("rounded-full px-3 py-1 text-xs font-medium", STATUS_STYLE[contract.status])}>
							{STATUS_LABEL[contract.status]}
						</span>
					</div>

					<div className="mb-5 flex flex-wrap gap-4 text-sm text-[#374151]">
						<div className="flex items-center gap-1.5">
							<Package size={14} className="text-[#9CA3AF]" />
							<span>
								{CURRENCY_SYMBOL[contract.quote.currency]}{" "}
								{contract.quote.price.toLocaleString()}
							</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Calendar size={14} className="text-[#9CA3AF]" />
							<span>납기 {contract.quote.deliveryDays}일</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Calendar size={14} className="text-[#9CA3AF]" />
							<span>{new Date(contract.createdAt).toLocaleDateString("ko-KR")} 계약</span>
						</div>
					</div>

					{contract.status === "ongoing" && (
						<div className="flex gap-2">
							{role === "buyer" && (
								<button
									onClick={() => handleStatusChange(contract.id, "completed")}
									disabled={loadingId === contract.id}
									className="flex-1 rounded-lg bg-[#16A34A] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#15803D] disabled:opacity-60"
								>
									{loadingId === contract.id ? "처리 중..." : "납품 완료"}
								</button>
							)}
							<button
								onClick={() => handleStatusChange(contract.id, "cancelled")}
								disabled={loadingId === contract.id}
								className="flex-1 rounded-lg border border-[#E5E7EB] py-2.5 text-[13px] font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60"
							>
								{loadingId === contract.id ? "처리 중..." : "계약 취소"}
							</button>
						</div>
					)}
				</div>
			))}
		</div>
	);
}