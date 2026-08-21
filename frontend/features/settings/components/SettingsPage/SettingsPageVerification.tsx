// features/settings/components/SettingsPage/SettingsPageVerification.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { AlertCircle, CheckCircle2, FileText, Loader2, ShieldCheck, Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { VerificationBadge } from "@/features/verification/components/VerificationBadge";
import type { CompanyVerification } from "@/features/verification/types";
import {
	SECTION_CLASS,
	HEADING_CLASS,
	HINT_CLASS,
	INPUT_CLASS,
	LABEL_CLASS,
	feedbackBox,
	type Feedback,
} from "@/features/settings/components/SettingsPage";

type SettingsPageVerificationProps = {
	country: "korea" | "indonesia" | null;
	businessNumber: string;
	verification: CompanyVerification | null;
	profileEditHref: string;
};

type Mode = "kr" | "document";

export function SettingsPageVerification({
	country,
	businessNumber,
	verification,
	profileEditHref,
}: SettingsPageVerificationProps): React.JSX.Element {
	const t = useTranslations("SettingsVerification");
	const router = useRouter();
	const status = verification?.status ?? "unverified";

	const [mode, setMode] = useState<Mode>(country === "korea" ? "kr" : "document");
	const [startDate, setStartDate] = useState("");
	const [representativeName, setRepresentativeName] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const [krMismatch, setKrMismatch] = useState<string | null>(null);

	async function handleVerifyKr(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		if (!businessNumber || !startDate || !representativeName) {
			setFeedback({ kind: "ERROR", message: t("requiredFields") });
			return;
		}

		setIsSubmitting(true);
		setFeedback(null);
		setKrMismatch(null);
		try {
			const res = await fetch("/api/verification/verify-kr", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					businessNumber,
					startDate,
					representativeName,
				}),
			});

			if (res.status === 503) {
				setFeedback({ kind: "ERROR", message: t("ntsNotConfigured") });
				return;
			}
			if (!res.ok) {
				const { error } = await res.json();
				setFeedback({ kind: "ERROR", message: error ?? t("verifyError") });
				return;
			}

			const data = await res.json();
			if (!data.verified) {
				setKrMismatch(data.message || t("krMismatch"));
				return;
			}

			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleUploadDocument(e: React.FormEvent): Promise<void> {
		e.preventDefault();
		if (!file) {
			setFeedback({ kind: "ERROR", message: t("fileRequired") });
			return;
		}

		setIsSubmitting(true);
		setFeedback(null);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch("/api/verification/verify-document", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const { error } = await res.json();
				setFeedback({ kind: "ERROR", message: error ?? t("uploadError") });
				return;
			}

			router.refresh();
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className={SECTION_CLASS}>
			<h2 className={HEADING_CLASS}>
				<ShieldCheck size={16} className="text-[#6B7280]" />
				{t("title")}
			</h2>
			<p className={HINT_CLASS}>{t("hint")}</p>

			<div className="mb-4 flex items-center gap-2">
				<VerificationBadge status={status} />
				{status === "unverified" && (
					<span className="text-sm text-[#6B7280]">{t("statusUnverified")}</span>
				)}
				{status === "pending" && <span className="text-sm text-[#6B7280]">{t("statusPending")}</span>}
				{status === "verified" && verification?.verifiedAt && (
					<span className="text-sm text-[#6B7280]">
						{t("statusVerified", { date: new Date(verification.verifiedAt).toLocaleDateString() })}
					</span>
				)}
			</div>

			{status === "rejected" && (
				<div className={feedbackBox({ kind: "ERROR" })}>
					<AlertCircle size={15} />
					{t("statusRejected", { note: verification?.note ?? "" })}
				</div>
			)}

			{feedback && (
				<div className={feedbackBox({ kind: feedback.kind })}>
					{feedback.kind === "SUCCESS" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
					{feedback.message}
				</div>
			)}

			{(status === "unverified" || status === "rejected") && (
				<>
					{mode === "kr" ? (
						<form onSubmit={handleVerifyKr} className="space-y-4">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className={LABEL_CLASS}>{t("businessNumberLabel")}</label>
									<input
										type="text"
										value={businessNumber}
										placeholder={t("businessNumberPlaceholder")}
										readOnly
										className={cn(INPUT_CLASS, "cursor-not-allowed bg-[#F9FAFB] text-[#6B7280]")}
									/>
									<Link
										href={profileEditHref}
										className="text-imsg-blue mt-1 inline-block text-xs font-medium hover:underline">
										{t("editCompanyInfoLink")}
									</Link>
								</div>
								<div>
									<label className={LABEL_CLASS}>{t("startDateLabel")}</label>
									<input
										type="date"
										value={startDate}
										onChange={(e) => setStartDate(e.target.value.replace(/-/g, ""))}
										className={INPUT_CLASS}
									/>
								</div>
								<div className="sm:col-span-2">
									<label className={LABEL_CLASS}>{t("representativeNameLabel")}</label>
									<input
										type="text"
										value={representativeName}
										placeholder={t("representativeNamePlaceholder")}
										onChange={(e) => setRepresentativeName(e.target.value)}
										className={INPUT_CLASS}
									/>
								</div>
							</div>

							{krMismatch && (
								<div className={feedbackBox({ kind: "ERROR" })}>
									<AlertCircle size={15} />
									{krMismatch}
								</div>
							)}

							<div className="flex flex-wrap items-center gap-3">
								<button
									type="submit"
									disabled={isSubmitting}
									className="bg-imsg-blue flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
									{isSubmitting && <Loader2 size={15} className="animate-spin" />}
									{t("verifyKrButton")}
								</button>
								{krMismatch && (
									<button
										type="button"
										onClick={() => {
											setMode("document");
											setKrMismatch(null);
										}}
										className="text-imsg-blue text-sm font-medium hover:underline">
										{t("switchToDocumentButton")}
									</button>
								)}
							</div>
						</form>
					) : (
						<form onSubmit={handleUploadDocument} className="space-y-4">
							<div>
								<label className={LABEL_CLASS}>{t("documentLabel")}</label>
								<p className="mb-2 text-xs text-[#9CA3AF]">{t("documentHint")}</p>
								<input
									type="file"
									accept="application/pdf,image/jpeg,image/png,image/webp"
									onChange={(e) => setFile(e.target.files?.[0] ?? null)}
									className="block w-full text-sm text-[#374151] file:mr-3 file:rounded-lg file:border-0 file:bg-imsg-surface file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-[#374151]"
								/>
							</div>

							<div className="flex flex-wrap items-center gap-3">
								<button
									type="submit"
									disabled={isSubmitting}
									className="bg-imsg-blue flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-60">
									{isSubmitting ? (
										<Loader2 size={15} className="animate-spin" />
									) : (
										<Upload size={15} />
									)}
									{t("uploadButton")}
								</button>
								{country === "korea" && (
									<button
										type="button"
										onClick={() => setMode("kr")}
										className="text-imsg-blue text-sm font-medium hover:underline">
										{t("switchToKrButton")}
									</button>
								)}
							</div>
						</form>
					)}
				</>
			)}

			{status === "pending" && verification?.method === "manual_document" && (
				<p className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
					<FileText size={13} />
					{t("documentSubmittedNote")}
				</p>
			)}
		</div>
	);
}
