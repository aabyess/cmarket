"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import type { AdminContract, ContractStatus } from "@/features/contract/types";

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

type AdminContractListProps = {
	contracts: AdminContract[];
};

export function AdminContractList({ contracts }: AdminContractListProps): React.ReactNode {
	const t = useTranslations("AdminContractList");
	const router = useRouter();
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const [confirmId, setConfirmId] = useState<string | null>(null);
	const [cancelId, setCancelId] = useState<string | null>(null);

	const statusLabels: Record<ContractStatus, string> = {
		ongoing: t("statusOngoing"),
		completed: t("statusCompleted"),
		cancelled: t("statusCancelled"),
	};

	async function updateStatus(contractId: string, status: "completed" | "cancelled"): Promise<void> {
		setLoadingId(contractId);
		try {
			const res = await fetch("/api/admin/contract/status", {
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
			alert(t("genericErrorMessage"));
		} finally {
			setLoadingId(null);
			setConfirmId(null);
			setCancelId(null);
		}
	}

	if (contracts.length === 0) {
		return (
			<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
				<p className="text-sm text-[#6B7280]">{t("emptyTitle")}</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-medium text-[#9CA3AF]">
							<th className="px-4 py-3">{t("columnStatus")}</th>
							<th className="px-4 py-3">{t("columnTitle")}</th>
							<th className="px-4 py-3">{t("columnBuyer")}</th>
							<th className="px-4 py-3">{t("columnSeller")}</th>
							<th className="px-4 py-3">{t("columnAmount")}</th>
							<th className="px-4 py-3">{t("columnContractDate")}</th>
							<th className="px-4 py-3 text-right">{t("columnAction")}</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[#F3F4F6]">
						{contracts.map((contract) => (
							<tr key={contract.id} className="hover:bg-[#F9FAFB]">
								<td className="whitespace-nowrap px-4 py-3">
									<span
										className={cn(
											"whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
											STATUS_STYLE[contract.status],
										)}
									>
										{statusLabels[contract.status]}
									</span>
								</td>
								<td className="max-w-[220px] truncate px-4 py-3 font-medium text-[#1F2937]">
									{contract.listing.title}
								</td>
								<td className="max-w-[140px] truncate px-4 py-3 text-[#6B7280]">
									{contract.buyerCompanyName || t("noCompanyName")}
								</td>
								<td className="max-w-[140px] truncate px-4 py-3 text-[#6B7280]">
									{contract.sellerCompanyName || t("noCompanyName")}
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-[#1F2937]">
									{CURRENCY_SYMBOL[contract.quote.currency]} {contract.quote.price.toLocaleString()}
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-[#9CA3AF]">
									{new Date(contract.createdAt).toLocaleDateString("ko-KR")}
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-right">
									{contract.status === "ongoing" ? (
										<div className="flex justify-end gap-1.5">
											<button
												onClick={() => setConfirmId(contract.id)}
												disabled={loadingId === contract.id}
												className="flex items-center gap-1 rounded-lg bg-[#16A34A] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#15803D] disabled:opacity-60"
											>
												<CheckCircle2 size={14} />
												{t("confirmAction")}
											</button>
											<button
												onClick={() => setCancelId(contract.id)}
												disabled={loadingId === contract.id}
												className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60"
											>
												<XCircle size={14} />
												{t("cancelAction")}
											</button>
										</div>
									) : (
										<span className="text-xs text-[#9CA3AF]">
											{contract.status === "completed" && contract.paymentConfirmedAt
												? new Date(contract.paymentConfirmedAt).toLocaleDateString("ko-KR")
												: "-"}
										</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<ConfirmModal
				isOpen={confirmId !== null}
				title={t("confirmModalTitle")}
				description={t("confirmModalDescription")}
				confirmLabel={t("confirmAction")}
				variant="default"
				isLoading={loadingId === confirmId}
				onConfirm={() => confirmId && updateStatus(confirmId, "completed")}
				onClose={() => setConfirmId(null)}
			/>

			<ConfirmModal
				isOpen={cancelId !== null}
				title={t("cancelModalTitle")}
				description={t("cancelModalDescription")}
				confirmLabel={t("cancelAction")}
				variant="danger"
				isLoading={loadingId === cancelId}
				onConfirm={() => cancelId && updateStatus(cancelId, "cancelled")}
				onClose={() => setCancelId(null)}
			/>
		</div>
	);
}
