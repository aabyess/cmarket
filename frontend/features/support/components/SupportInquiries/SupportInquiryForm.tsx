"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { getInquiryCategoryLabels, INQUIRY_CATEGORY_OPTIONS } from "@/features/support/constants";
import type { InquiryCategory } from "@/features/support/types";

const INPUT_CLASS =
	"w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#0f172a] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue";

export function SupportInquiryForm(): React.JSX.Element {
	const t = useTranslations("SupportInquiryForm");
	const inquiryCategoryLabels = getInquiryCategoryLabels(useTranslations("InquiryCategoryLabel"));
	const router = useRouter();
	const [category, setCategory] = useState<InquiryCategory>("ETC");
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !isSaving;

	async function handleSubmit(): Promise<void> {
		setIsSaving(true);
		setError(null);
		try {
			const res = await fetch("/api/support/inquiry", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ category, title, content }),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(data.error ?? t("submitFailed"));
				return;
			}

			const { inquiryId } = await res.json();
			router.push(`/support/inquiries/${inquiryId}`);
			router.refresh();
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
			<div>
				<label className="mb-1.5 block text-xs font-medium text-[#374151]">{t("categoryLabel")}</label>
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value as InquiryCategory)}
					className={INPUT_CLASS}>
					{INQUIRY_CATEGORY_OPTIONS.map((option) => (
						<option key={option} value={option}>
							{inquiryCategoryLabels[option]}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className="mb-1.5 block text-xs font-medium text-[#374151]">{t("titleLabel")}</label>
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder={t("titlePlaceholder")}
					className={INPUT_CLASS}
				/>
			</div>

			<div>
				<label className="mb-1.5 block text-xs font-medium text-[#374151]">{t("contentLabel")}</label>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={10}
					placeholder={t("contentPlaceholder")}
					className={`${INPUT_CLASS} resize-none leading-relaxed`}
				/>
			</div>

			{error && (
				<p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
					{error}
				</p>
			)}

			<button
				type="button"
				onClick={handleSubmit}
				disabled={!canSubmit}
				className="flex w-full items-center justify-center gap-2 rounded-xl bg-imsg-blue py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600 disabled:opacity-40">
				{isSaving && <Loader2 size={15} className="animate-spin" />}
				{t("submit")}
			</button>
		</div>
	);
}
