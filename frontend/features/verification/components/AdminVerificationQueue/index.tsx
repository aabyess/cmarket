// features/verification/components/AdminVerificationQueue/index.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, FileText, Loader2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AdminVerificationRejectModal } from "@/features/verification/components/AdminVerificationQueue/AdminVerificationRejectModal";
import { VerificationBadge } from "@/features/verification/components/VerificationBadge";
import type { VerificationQueueItem } from "@/features/verification/types";

type StatusTab = "all" | "pending" | "verified" | "rejected";

const TAB_VALUES: StatusTab[] = ["all", "pending", "verified", "rejected"];

type AdminVerificationQueueProps = {
	items: VerificationQueueItem[];
};

export function AdminVerificationQueue({ items }: AdminVerificationQueueProps): React.ReactNode {
	const t = useTranslations("AdminVerificationQueue");
	const router = useRouter();
	const [tab, setTab] = useState<StatusTab>("pending");
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [approveId, setApproveId] = useState<string | null>(null);
	const [rejectId, setRejectId] = useState<string | null>(null);
	const [openingDocId, setOpeningDocId] = useState<string | null>(null);

	const tabLabels: Record<StatusTab, string> = {
		all: t("tabAll"),
		pending: t("tabPending"),
		verified: t("tabVerified"),
		rejected: t("tabRejected"),
	};

	const methodLabels: Record<"nts_api" | "manual_document", string> = {
		nts_api: t("methodNtsApi"),
		manual_document: t("methodManualDocument"),
	};

	const countryLabels: Record<"korea" | "indonesia", string> = {
		korea: t("countryKorea"),
		indonesia: t("countryIndonesia"),
	};

	const filteredItems = tab === "all" ? items : items.filter((item) => item.status === tab);

	async function handleReview(profileId: string, action: "approve" | "reject", note?: string): Promise<void> {
		setProcessingId(profileId);
		try {
			const res = await fetch("/api/admin/verification-review", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ profileId, action, note }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("reviewErrorMessage"));
		} finally {
			setProcessingId(null);
			setApproveId(null);
			setRejectId(null);
		}
	}

	async function handleViewDocument(profileId: string): Promise<void> {
		setOpeningDocId(profileId);
		try {
			const res = await fetch(`/api/verification/document-url?profileId=${profileId}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			window.open(data.url, "_blank", "noopener,noreferrer");
		} catch (err) {
			console.error(err);
			alert(t("documentOpenErrorMessage"));
		} finally {
			setOpeningDocId(null);
		}
	}

	return (
		<div>
			<div className="mb-4 flex items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1 w-fit">
				{TAB_VALUES.map((option) => (
					<button
						key={option}
						type="button"
						onClick={() => setTab(option)}
						className={cn(
							"rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
							tab === option ? "bg-[#EFF6FF] text-imsg-blue" : "text-[#374151] hover:bg-imsg-surface",
						)}>
						{tabLabels[option]}
					</button>
				))}
			</div>

			{filteredItems.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<p className="text-sm text-[#6B7280]">{t("emptyTitle")}</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse text-sm">
							<thead>
								<tr className="border-b border-[#E5E7EB] bg-[#F9FAFB] text-left text-xs font-medium text-[#9CA3AF]">
									<th className="px-4 py-3">{t("columnCompany")}</th>
									<th className="px-4 py-3">{t("columnCountry")}</th>
									<th className="px-4 py-3">{t("columnBusinessNumber")}</th>
									<th className="px-4 py-3">{t("columnMethod")}</th>
									<th className="px-4 py-3">{t("columnDocument")}</th>
									<th className="px-4 py-3">{t("columnRequestedAt")}</th>
									<th className="px-4 py-3">{t("columnStatus")}</th>
									<th className="px-4 py-3 text-right">{t("columnAction")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#F3F4F6]">
								{filteredItems.map((item) => (
									<tr key={item.profileId} className="hover:bg-[#F9FAFB]">
										<td className="max-w-[180px] truncate px-4 py-3 font-medium text-[#1F2937]">
											{item.companyName || t("noCompanyName")}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-[#6B7280]">
											{item.country ? countryLabels[item.country] : "-"}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-[#6B7280]">
											{item.businessNumber || item.nib || "-"}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-[#6B7280]">
											{item.method ? methodLabels[item.method] : "-"}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											{item.documentUrl ? (
												<button
													type="button"
													onClick={() => handleViewDocument(item.profileId)}
													disabled={openingDocId === item.profileId}
													className="text-imsg-blue flex items-center gap-1 text-xs font-medium hover:underline disabled:opacity-50">
													{openingDocId === item.profileId ? (
														<Loader2 size={12} className="animate-spin" />
													) : (
														<FileText size={12} />
													)}
													{t("viewDocumentButton")}
												</button>
											) : (
												<span className="text-xs text-[#9CA3AF]">-</span>
											)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-[#9CA3AF]">
											{item.requestedAt ? new Date(item.requestedAt).toLocaleDateString("ko-KR") : "-"}
										</td>
										<td className="whitespace-nowrap px-4 py-3">
											<VerificationBadge status={item.status} />
											{item.status === "rejected" && item.note && (
												<p className="mt-1 max-w-[160px] truncate text-xs text-[#9CA3AF]" title={item.note}>
													{item.note}
												</p>
											)}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right">
											{item.status === "pending" ? (
												<div className="flex justify-end gap-1.5">
													<button
														onClick={() => setApproveId(item.profileId)}
														disabled={processingId === item.profileId}
														className="flex items-center gap-1 rounded-lg bg-[#16A34A] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#15803D] disabled:opacity-60">
														<CheckCircle2 size={14} />
														{t("approveAction")}
													</button>
													<button
														onClick={() => setRejectId(item.profileId)}
														disabled={processingId === item.profileId}
														className="flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:opacity-60">
														<XCircle size={14} />
														{t("rejectAction")}
													</button>
												</div>
											) : (
												<span className="text-xs text-[#9CA3AF]">-</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<ConfirmModal
				isOpen={approveId !== null}
				title={t("approveModalTitle")}
				description={t("approveModalDescription")}
				confirmLabel={t("approveAction")}
				variant="default"
				isLoading={processingId === approveId}
				onConfirm={() => approveId && handleReview(approveId, "approve")}
				onClose={() => setApproveId(null)}
			/>

			<AdminVerificationRejectModal
				isOpen={rejectId !== null}
				isLoading={processingId === rejectId}
				onConfirm={(note) => rejectId && handleReview(rejectId, "reject", note)}
				onClose={() => setRejectId(null)}
			/>
		</div>
	);
}
