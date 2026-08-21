// features/settings/components/SettingsPage/SettingsPageBankAccount.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { CURRENCY_OPTIONS } from "@/features/siteBuilder/constants";
import type { SiteBankAccount } from "@/features/siteBuilder/types";
import {
	SECTION_CLASS,
	HEADING_CLASS,
	HINT_CLASS,
	INPUT_CLASS,
	LABEL_CLASS,
	feedbackBox,
	type Feedback,
} from "@/features/settings/components/SettingsPage";

type SettingsPageBankAccountProps = {
	bankAccount: SiteBankAccount;
};

export function SettingsPageBankAccount({
	bankAccount,
}: SettingsPageBankAccountProps): React.JSX.Element {
	const t = useTranslations("Settings");
	const tTradeSettings = useTranslations("SiteBuilderTradeSettings");

	const [bankName, setBankName] = useState(bankAccount.bankName);
	const [accountNumber, setAccountNumber] = useState(bankAccount.accountNumber);
	const [accountHolder, setAccountHolder] = useState(bankAccount.accountHolder);
	const [swiftCode, setSwiftCode] = useState(bankAccount.swiftCode);
	const [currency, setCurrency] = useState(bankAccount.currency);
	const [isSaving, setIsSaving] = useState(false);
	const [feedback, setFeedback] = useState<Feedback | null>(null);

	async function handleSave(e: React.FormEvent): Promise<void> {
		e.preventDefault();

		if (!bankName || !accountNumber || !accountHolder) {
			setFeedback({ kind: "ERROR", message: t("bankAccountRequiredFields") });
			return;
		}

		setIsSaving(true);
		setFeedback(null);
		try {
			const res = await fetch("/api/settings/bank-account", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bankName, accountNumber, accountHolder, swiftCode, currency }),
			});

			if (!res.ok) {
				const { error } = await res.json();
				setFeedback({ kind: "ERROR", message: error ?? t("bankAccountSaveError") });
				return;
			}

			setFeedback({ kind: "SUCCESS", message: t("bankAccountSaveSuccess") });
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div id="bankAccount" className={SECTION_CLASS}>
			<h2 className={HEADING_CLASS}>
				<CreditCard size={16} className="text-[#6B7280]" />
				{tTradeSettings("bankTitle")}
			</h2>
			<p className={HINT_CLASS}>{tTradeSettings("bankHint")}</p>

			{feedback && (
				<div className={feedbackBox({ kind: feedback.kind })}>
					{feedback.kind === "SUCCESS" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
					{feedback.message}
				</div>
			)}

			<form onSubmit={handleSave} className="space-y-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label className={LABEL_CLASS}>{tTradeSettings("bankNameLabel")}</label>
						<input
							type="text"
							value={bankName}
							placeholder={tTradeSettings("bankNamePlaceholder")}
							onChange={(e) => setBankName(e.target.value)}
							className={INPUT_CLASS}
						/>
					</div>
					<div>
						<label className={LABEL_CLASS}>{tTradeSettings("currencyLabel")}</label>
						<select
							value={currency}
							onChange={(e) => setCurrency(e.target.value)}
							className={INPUT_CLASS}>
							{CURRENCY_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className={LABEL_CLASS}>{tTradeSettings("accountNumberLabel")}</label>
						<input
							type="text"
							value={accountNumber}
							placeholder={tTradeSettings("accountNumberPlaceholder")}
							onChange={(e) => setAccountNumber(e.target.value)}
							className={INPUT_CLASS}
						/>
					</div>
					<div>
						<label className={LABEL_CLASS}>{tTradeSettings("accountHolderLabel")}</label>
						<input
							type="text"
							value={accountHolder}
							placeholder={tTradeSettings("accountHolderPlaceholder")}
							onChange={(e) => setAccountHolder(e.target.value)}
							className={INPUT_CLASS}
						/>
					</div>
					<div className="sm:col-span-2">
						<label className={LABEL_CLASS}>{tTradeSettings("swiftCodeLabel")}</label>
						<input
							type="text"
							value={swiftCode}
							placeholder={tTradeSettings("swiftCodePlaceholder")}
							onChange={(e) => setSwiftCode(e.target.value)}
							className={INPUT_CLASS}
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSaving}
					className="bg-imsg-blue flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
					{isSaving && <Loader2 size={15} className="animate-spin" />}
					{t("bankAccountSaveButton")}
				</button>
			</form>
		</div>
	);
}
