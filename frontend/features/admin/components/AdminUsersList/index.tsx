// features/admin/components/AdminUsersList/index.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { cn } from "@/utils/cn";
import { Pagination } from "@/components/commons/Pagination";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AdminUserEditModal } from "@/features/admin/components/AdminUsersList/AdminUserEditModal";
import type { Plan } from "@/constants/plan";
import type { AdminUser, AdminUserRole } from "@/features/admin/types";

const PLAN_VALUES: Plan[] = ["free", "pro", "max"];

type StatusTab = "all" | "buyer" | "seller";

const TAB_VALUES: StatusTab[] = ["all", "buyer", "seller"];

const ROLE_BADGE_STYLE: Record<AdminUserRole, string> = {
	buyer: "bg-[#EFF6FF] text-imsg-blue",
	seller: "bg-[#F0FDF4] text-[#16A34A]",
	admin: "bg-[#F3F4F6] text-[#6B7280]",
};

type AdminUsersListProps = {
	users: AdminUser[];
	currentUserId: string;
};

export function AdminUsersList({ users, currentUserId }: AdminUsersListProps): React.ReactNode {
	const t = useTranslations("AdminUsersList");
	const router = useRouter();
	const [tab, setTab] = useState<StatusTab>("all");
	const [keyword, setKeyword] = useState("");
	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const tabLabels: Record<StatusTab, string> = {
		all: t("tabAll"),
		buyer: t("tabBuyer"),
		seller: t("tabSeller"),
	};

	const roleLabels: Record<AdminUserRole, string> = {
		buyer: t("roleBuyer"),
		seller: t("roleSeller"),
		admin: t("roleAdmin"),
	};

	const countryLabels: Record<"korea" | "indonesia", string> = {
		korea: t("countryKorea"),
		indonesia: t("countryIndonesia"),
	};

	const trimmedKeyword = keyword.trim().toLowerCase();

	const filteredUsers = useMemo(() => {
		return users.filter((user) => {
			if (tab !== "all" && user.role !== tab) return false;
			if (!trimmedKeyword) return true;
			const haystack = [user.companyName, user.username].join(" ").toLowerCase();
			return haystack.includes(trimmedKeyword);
		});
	}, [users, tab, trimmedKeyword]);

	useEffect(() => {
		setPage(1);
	}, [tab, trimmedKeyword, pageSize]);

	const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
	const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

	async function handlePlanChange(profileId: string, plan: Plan): Promise<void> {
		setUpdatingId(profileId);
		try {
			const res = await fetch("/api/admin/user-plan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ profileId, plan }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(t("planChangeErrorMessage"));
		} finally {
			setUpdatingId(null);
		}
	}

	async function handleConfirmDelete(): Promise<void> {
		if (!deletingUser) return;
		setIsDeleting(true);
		try {
			const res = await fetch("/api/admin/user-delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ profileId: deletingUser.id }),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			setDeletingUser(null);
			router.refresh();
		} catch (err) {
			console.error(err);
			alert(err instanceof Error && err.message ? err.message : t("deleteErrorMessage"));
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
					{TAB_VALUES.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => setTab(option)}
							className={cn(
								"rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
								tab === option
									? "bg-[#EFF6FF] text-imsg-blue"
									: "text-[#374151] hover:bg-imsg-surface",
							)}>
							{tabLabels[option]}
						</button>
					))}
				</div>

				<div className="relative min-w-[220px] flex-1">
					<Search
						size={16}
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
					/>
					<input
						type="text"
						value={keyword}
						onChange={(e) => setKeyword(e.target.value)}
						placeholder={t("searchPlaceholder")}
						className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
					/>
				</div>
			</div>

			{filteredUsers.length === 0 ? (
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
									<th className="px-4 py-3">{t("columnRepresentative")}</th>
									<th className="px-4 py-3">{t("columnRole")}</th>
									<th className="px-4 py-3">{t("columnCountry")}</th>
									<th className="px-4 py-3">{t("columnPlan")}</th>
									<th className="px-4 py-3">{t("columnJoinedAt")}</th>
									<th className="px-4 py-3">{t("columnActions")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#F3F4F6]">
								{paginatedUsers.map((user) => {
									const isSelf = user.id === currentUserId;

									return (
										<tr key={user.id} className="hover:bg-[#F9FAFB]">
											<td className="max-w-[180px] truncate px-4 py-3 font-medium text-[#1F2937]">
												{user.companyName || t("noCompanyName")}
												<p className="truncate text-xs font-normal text-[#9CA3AF]">
													{user.username}
												</p>
											</td>
											<td className="max-w-[140px] truncate px-4 py-3 text-[#6B7280]">
												{user.representative || t("noRepresentative")}
											</td>
											<td className="whitespace-nowrap px-4 py-3">
												<span
													className={cn(
														"rounded-full px-2.5 py-1 text-xs font-medium",
														ROLE_BADGE_STYLE[user.role],
													)}>
													{roleLabels[user.role]}
												</span>
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-[#6B7280]">
												{user.country ? countryLabels[user.country] : t("countryUnknown")}
											</td>
											<td className="whitespace-nowrap px-4 py-3">
												<select
													value={user.plan}
													onChange={(e) => handlePlanChange(user.id, e.target.value as Plan)}
													disabled={isSelf || updatingId === user.id}
													className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-xs font-medium text-[#374151] focus:border-imsg-blue focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
													{PLAN_VALUES.map((plan) => (
														<option key={plan} value={plan}>
															{plan.toUpperCase()}
														</option>
													))}
												</select>
											</td>
											<td className="whitespace-nowrap px-4 py-3 text-[#9CA3AF]">
												{new Date(user.createdAt).toLocaleDateString("ko-KR")}
											</td>
											<td className="whitespace-nowrap px-4 py-3">
												<div className="flex items-center gap-1.5">
													<button
														onClick={() => setEditingUser(user)}
														className="rounded-lg border border-[#E5E7EB] px-2.5 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:bg-imsg-surface">
														{t("editAction")}
													</button>
													<button
														onClick={() => setDeletingUser(user)}
														disabled={isSelf || user.role === "admin"}
														className="rounded-lg border border-[#FEE2E2] px-2.5 py-1.5 text-xs font-medium text-[#DC2626] transition-colors hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-40">
														{t("deleteAction")}
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{filteredUsers.length > 0 && (
				<Pagination
					page={page}
					pageCount={pageCount}
					pageSize={pageSize}
					onPageChange={setPage}
					onPageSizeChange={setPageSize}
					pageSizeOptions={[20, 50, 100]}
				/>
			)}

			<AdminUserEditModal
				user={editingUser}
				onClose={() => setEditingUser(null)}
				onSaved={() => router.refresh()}
			/>

			<ConfirmModal
				isOpen={Boolean(deletingUser)}
				variant="danger"
				title={t("deleteModalTitle")}
				description={
					deletingUser
						? t("deleteModalDescription", { companyName: deletingUser.companyName || t("noCompanyName") })
						: undefined
				}
				confirmLabel={t("deleteAction")}
				isLoading={isDeleting}
				onConfirm={handleConfirmDelete}
				onClose={() => setDeletingUser(null)}
			/>
		</div>
	);
}
