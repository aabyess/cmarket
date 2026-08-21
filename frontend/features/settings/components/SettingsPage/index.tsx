// features/settings/components/SettingsPage/index.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cva } from "class-variance-authority";
import { AlertCircle, ArrowRight, CheckCircle2, Globe, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/libs/supabase";
import { SettingsPageBankAccount } from "@/features/settings/components/SettingsPage/SettingsPageBankAccount";
import { SettingsPageVerification } from "@/features/settings/components/SettingsPage/SettingsPageVerification";
import type { SiteBankAccount } from "@/features/siteBuilder/types";
import type { CompanyVerification } from "@/features/verification/types";

type SettingsPageProps = {
	role: "buyer" | "seller";
	email: string;
	bankAccount: SiteBankAccount | null;
	country: "korea" | "indonesia" | null;
	businessNumber: string;
	verification: CompanyVerification | null;
};

export type Feedback = { kind: "SUCCESS" | "ERROR"; message: string };

export const SECTION_CLASS = "rounded-2xl border border-[#E5E7EB] bg-white p-6";
export const HEADING_CLASS = "flex items-center gap-2 text-sm font-semibold text-[#1F2937]";
export const HINT_CLASS = "mb-4 mt-1 text-xs text-[#9CA3AF]";
export const INPUT_CLASS =
	"w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue";
export const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-[#374151]";

export const feedbackBox = cva(
	"mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium",
	{
		variants: {
			kind: {
				SUCCESS: "border border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
				ERROR: "border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
			},
		},
		defaultVariants: { kind: "SUCCESS" },
	},
);

const localeButton = cva("rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors", {
	variants: {
		active: {
			true: "border-imsg-blue bg-[#EFF6FF] text-imsg-blue",
			false: "border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50",
		},
	},
	defaultVariants: { active: false },
});

export function SettingsPage({
	role,
	email,
	bankAccount,
	country,
	businessNumber,
	verification,
}: SettingsPageProps): React.JSX.Element {
	const t = useTranslations("Settings");
	const tLocales = useTranslations("Locales");
	const locale = useLocale();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [passwordFeedback, setPasswordFeedback] = useState<Feedback | null>(null);

	const profileEditHref = role === "buyer" ? "/buyer/profile/edit" : "/seller/profile/edit";

	function handleLocaleChange(nextLocale: string): void {
		const query = searchParams.toString();
		const href = query ? `${pathname}?${query}` : pathname;
		router.replace(href, { locale: nextLocale });
	}

	async function handleChangePassword(e: React.FormEvent): Promise<void> {
		e.preventDefault();

		if (newPassword.length < 8) {
			setPasswordFeedback({ kind: "ERROR", message: t("passwordTooShort") });
			return;
		}
		if (newPassword !== confirmPassword) {
			setPasswordFeedback({ kind: "ERROR", message: t("passwordMismatch") });
			return;
		}

		setIsChangingPassword(true);
		setPasswordFeedback(null);
		try {
			const supabase = createClient();

			// updateUser는 현재 비밀번호를 확인하지 않으므로, 재로그인으로 먼저 본인 확인을 한다.
			const { error: signInError } = await supabase.auth.signInWithPassword({
				email,
				password: currentPassword,
			});
			if (signInError) {
				setPasswordFeedback({ kind: "ERROR", message: t("currentPasswordIncorrect") });
				return;
			}

			const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
			if (updateError) {
				setPasswordFeedback({ kind: "ERROR", message: t("passwordChangeError") });
				return;
			}

			setPasswordFeedback({ kind: "SUCCESS", message: t("passwordChangeSuccess") });
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} finally {
			setIsChangingPassword(false);
		}
	}

	return (
		<div className="space-y-5">
			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<Mail size={16} className="text-[#6B7280]" />
					{t("accountTitle")}
				</h2>
				<p className={HINT_CLASS}>{t("accountHint")}</p>

				<div className="mb-4">
					<label className={LABEL_CLASS}>{t("emailLabel")}</label>
					<p className="rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] px-3.5 py-2.5 text-sm text-[#6B7280]">
						{email}
					</p>
				</div>

				<Link
					href={profileEditHref}
					className="text-imsg-blue inline-flex items-center gap-1 text-sm font-medium hover:underline">
					{t("editProfileLink")}
					<ArrowRight size={14} />
				</Link>
			</div>

			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<Lock size={16} className="text-[#6B7280]" />
					{t("passwordTitle")}
				</h2>
				<p className={HINT_CLASS}>{t("passwordHint")}</p>

				{passwordFeedback && (
					<div className={feedbackBox({ kind: passwordFeedback.kind })}>
						{passwordFeedback.kind === "SUCCESS" ? (
							<CheckCircle2 size={15} />
						) : (
							<AlertCircle size={15} />
						)}
						{passwordFeedback.message}
					</div>
				)}

				<form onSubmit={handleChangePassword} className="space-y-4">
					<div>
						<label className={LABEL_CLASS}>{t("currentPasswordLabel")}</label>
						<input
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className={INPUT_CLASS}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className={LABEL_CLASS}>{t("newPasswordLabel")}</label>
							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className={INPUT_CLASS}
							/>
						</div>
						<div>
							<label className={LABEL_CLASS}>{t("confirmPasswordLabel")}</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className={INPUT_CLASS}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
						className="bg-imsg-blue flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
						{isChangingPassword && <Loader2 size={15} className="animate-spin" />}
						{t("changePasswordButton")}
					</button>
				</form>
			</div>

			<div className={SECTION_CLASS}>
				<h2 className={HEADING_CLASS}>
					<Globe size={16} className="text-[#6B7280]" />
					{t("languageTitle")}
				</h2>
				<p className={HINT_CLASS}>{t("languageHint")}</p>

				<div className="grid grid-cols-3 gap-2">
					{routing.locales.map((loc) => (
						<button
							key={loc}
							type="button"
							onClick={() => handleLocaleChange(loc)}
							className={localeButton({ active: loc === locale })}>
							{tLocales(loc)}
						</button>
					))}
				</div>
			</div>

			<SettingsPageVerification
				country={country}
				businessNumber={businessNumber}
				verification={verification}
			/>

			{role === "seller" && bankAccount && <SettingsPageBankAccount bankAccount={bankAccount} />}
		</div>
	);
}
