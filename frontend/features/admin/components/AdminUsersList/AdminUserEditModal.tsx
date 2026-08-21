// features/admin/components/AdminUsersList/AdminUserEditModal.tsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { getModalPanelTransition } from "@/utils/modalMotion";
import type { AdminUser } from "@/features/admin/types";

type AdminUserEditModalProps = {
	user: AdminUser | null;
	onClose: () => void;
	onSaved: () => void;
};

type EditForm = {
	username: string;
	password: string;
	companyName: string;
	representative: string;
	businessNumber: string;
	npwp: string;
	nib: string;
	address: string;
	businessType: string;
	businessItem: string;
};

function toForm(user: AdminUser): EditForm {
	return {
		username: user.username,
		password: "",
		companyName: user.companyName,
		representative: user.representative,
		businessNumber: user.businessNumber,
		npwp: user.npwp,
		nib: user.nib,
		address: user.address,
		businessType: user.businessType,
		businessItem: user.businessItem,
	};
}

export function AdminUserEditModal({ user, onClose, onSaved }: AdminUserEditModalProps): React.ReactNode {
	const t = useTranslations("AdminUsersList");
	const prefersReducedMotion = useReducedMotion();
	const [form, setForm] = useState<EditForm | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (user) setForm(toForm(user));
	}, [user]);

	function handleChange<K extends keyof EditForm>(key: K, value: EditForm[K]): void {
		setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
	}

	async function handleSave(): Promise<void> {
		if (!user || !form) return;
		if (form.password && form.password.length < 8) {
			alert(t("editPasswordTooShort"));
			return;
		}

		setIsSaving(true);
		try {
			const res = await fetch("/api/admin/user-update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					profileId: user.id,
					username: form.username,
					password: form.password || undefined,
					companyName: form.companyName,
					representative: form.representative,
					businessNumber: user.country === "indonesia" ? undefined : form.businessNumber,
					npwp: user.country === "indonesia" ? form.npwp : undefined,
					nib: user.country === "indonesia" ? form.nib : undefined,
					address: form.address,
					businessType: form.businessType,
					businessItem: form.businessItem,
				}),
			});
			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}
			onSaved();
			onClose();
		} catch (err) {
			console.error(err);
			alert(err instanceof Error && err.message ? err.message : t("editErrorMessage"));
		} finally {
			setIsSaving(false);
		}
	}

	const isOpen = Boolean(user) && Boolean(form);

	return (
		<AnimatePresence>
			{isOpen && user && form && (
				<Dialog static open={isOpen} onClose={onClose} className="relative z-50">
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15 }}
						className="fixed inset-0 bg-black/40"
						aria-hidden="true"
					/>

					<div className="fixed inset-0 flex items-center justify-center p-4">
						<DialogPanel className="w-full max-w-md">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 8 }}
								transition={getModalPanelTransition(prefersReducedMotion)}
								className="max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
								<DialogTitle className="text-base font-semibold text-[#1F2937]">
									{t("editModalTitle")}
								</DialogTitle>

								<div className="mt-4 space-y-3">
									<Field label={t("editUsernameLabel")}>
										<input
											type="text"
											value={form.username}
											onChange={(e) => handleChange("username", e.target.value)}
											className={INPUT_CLASS}
										/>
									</Field>
									<Field label={t("editPasswordLabel")}>
										<input
											type="password"
											value={form.password}
											onChange={(e) => handleChange("password", e.target.value)}
											placeholder={t("editPasswordPlaceholder")}
											className={INPUT_CLASS}
										/>
									</Field>
									<Field label={t("editCompanyNameLabel")}>
										<input
											type="text"
											value={form.companyName}
											onChange={(e) => handleChange("companyName", e.target.value)}
											className={INPUT_CLASS}
										/>
									</Field>
									<Field label={t("editRepresentativeLabel")}>
										<input
											type="text"
											value={form.representative}
											onChange={(e) => handleChange("representative", e.target.value)}
											className={INPUT_CLASS}
										/>
									</Field>
									{user.country === "indonesia" ? (
										<>
											<Field label={t("editNpwpLabel")}>
												<input
													type="text"
													value={form.npwp}
													onChange={(e) => handleChange("npwp", e.target.value)}
													className={INPUT_CLASS}
												/>
											</Field>
											<Field label={t("editNibLabel")}>
												<input
													type="text"
													value={form.nib}
													onChange={(e) => handleChange("nib", e.target.value)}
													className={INPUT_CLASS}
												/>
											</Field>
										</>
									) : (
										<Field label={t("editBusinessNumberLabel")}>
											<input
												type="text"
												value={form.businessNumber}
												onChange={(e) => handleChange("businessNumber", e.target.value)}
												className={INPUT_CLASS}
											/>
										</Field>
									)}
									<Field label={t("editAddressLabel")}>
										<input
											type="text"
											value={form.address}
											onChange={(e) => handleChange("address", e.target.value)}
											className={INPUT_CLASS}
										/>
									</Field>
									<Field label={t("editBusinessTypeLabel")}>
										<input
											type="text"
											value={form.businessType}
											onChange={(e) => handleChange("businessType", e.target.value)}
											className={INPUT_CLASS}
										/>
									</Field>
									<Field label={t("editBusinessItemLabel")}>
										<input
											type="text"
											value={form.businessItem}
											onChange={(e) => handleChange("businessItem", e.target.value)}
											className={INPUT_CLASS}
										/>
									</Field>
								</div>

								<div className="mt-6 flex gap-2">
									<button
										onClick={onClose}
										disabled={isSaving}
										className="flex-1 rounded-lg border border-[#E5E7EB] py-3 text-sm font-medium text-[#374151] transition-colors hover:bg-gray-50 disabled:opacity-50">
										{t("editCancel")}
									</button>
									<button
										onClick={handleSave}
										disabled={isSaving}
										className="flex-1 rounded-lg bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
										{isSaving ? t("processing") : t("editSave")}
									</button>
								</div>
							</motion.div>
						</DialogPanel>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}

const INPUT_CLASS =
	"w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue";

type FieldProps = {
	label: string;
	children: React.ReactNode;
};

function Field({ label, children }: FieldProps): React.ReactNode {
	return (
		<label className="block">
			<span className="mb-1 block text-xs font-medium text-[#6B7280]">{label}</span>
			{children}
		</label>
	);
}
