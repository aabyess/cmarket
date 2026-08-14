"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cva } from "class-variance-authority";
import { Headset, Loader2, User } from "lucide-react";
import { getInquiryCategoryLabels, getInquiryStatusLabels } from "@/features/support/constants";
import type { Inquiry } from "@/features/support/types";

type SupportInquiryDetailProps = {
	inquiry: Inquiry;
	/** 운영자는 답변을, 문의자는 추가 질문을 남긴다. */
	isAdmin: boolean;
};

const statusChip = cva("whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", {
	variants: {
		status: {
			OPEN: "bg-[#FFFBEB] text-[#D97706]",
			ANSWERED: "bg-[#F0FDF4] text-[#16A34A]",
			CLOSED: "bg-[#F3F4F6] text-[#6B7280]",
		},
	},
	defaultVariants: { status: "OPEN" },
});

const replyCard = cva("rounded-2xl p-5", {
	variants: {
		staff: {
			true: "bg-[#EFF6FF]",
			false: "bg-white shadow-sm",
		},
	},
	defaultVariants: { staff: false },
});

function formatDateTime(value: string): string {
	return new Date(value).toLocaleString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function SupportInquiryDetail({
	inquiry,
	isAdmin,
}: SupportInquiryDetailProps): React.JSX.Element {
	const t = useTranslations("SupportInquiryDetail");
	const inquiryStatusLabels = getInquiryStatusLabels(useTranslations("InquiryStatusLabel"));
	const inquiryCategoryLabels = getInquiryCategoryLabels(useTranslations("InquiryCategoryLabel"));
	const router = useRouter();
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	async function handleReply(): Promise<void> {
		setIsSaving(true);
		try {
			const res = await fetch("/api/support/inquiry/reply", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ inquiryId: inquiry.id, content }),
			});

			if (!res.ok) {
				const { error } = await res.json();
				alert(error ?? t("submitFailed"));
				return;
			}

			setContent("");
			router.refresh();
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className="space-y-4">
			<article className="rounded-2xl bg-white p-6 shadow-sm">
				<div className="mb-2 flex flex-wrap items-center gap-2">
					<span className={statusChip({ status: inquiry.status })}>
						{inquiryStatusLabels[inquiry.status]}
					</span>
					<span className="rounded-full bg-imsg-surface px-2.5 py-1 text-xs font-medium text-imsg-secondary">
						{inquiryCategoryLabels[inquiry.category]}
					</span>
					<span className="text-xs text-imsg-secondary">{formatDateTime(inquiry.createdAt)}</span>
				</div>

				<h1 className="text-xl font-bold tracking-tight text-[#0f172a]">{inquiry.title}</h1>

				{isAdmin && inquiry.authorCompanyName && (
					<p className="mt-1 flex items-center gap-1.5 text-sm text-imsg-secondary">
						<User size={13} />
						{inquiry.authorCompanyName} · {inquiry.authorName}
					</p>
				)}

				<p className="mt-5 whitespace-pre-wrap border-t border-[#F2F2F7] pt-5 text-sm leading-relaxed text-[#374151]">
					{inquiry.content}
				</p>
			</article>

			{inquiry.replies.map((reply) => (
				<article key={reply.id} className={replyCard({ staff: reply.isStaff })}>
					<div className="mb-2 flex items-center gap-2">
						<span className="flex size-6 items-center justify-center rounded-full bg-white">
							{reply.isStaff ? (
								<Headset size={12} className="text-imsg-blue" />
							) : (
								<User size={12} className="text-imsg-secondary" />
							)}
						</span>
						<span className="text-sm font-semibold text-[#0f172a]">
							{reply.isStaff ? t("staffLabel") : t("additionalInquiry")}
						</span>
						<span className="text-xs text-imsg-secondary">{formatDateTime(reply.createdAt)}</span>
					</div>
					<p className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
						{reply.content}
					</p>
				</article>
			))}

			<div className="rounded-2xl bg-white p-5 shadow-sm">
				<label className="mb-1.5 block text-xs font-medium text-[#374151]">
					{isAdmin ? t("writeReply") : t("additionalInquiry")}
				</label>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={5}
					placeholder={isAdmin ? t("replyPlaceholder") : t("additionalPlaceholder")}
					className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm leading-relaxed text-[#0f172a] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
				/>
				<button
					type="button"
					onClick={handleReply}
					disabled={content.trim().length === 0 || isSaving}
					className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600 disabled:opacity-40">
					{isSaving && <Loader2 size={15} className="animate-spin" />}
					{isAdmin ? t("submitReply") : t("submitAdditionalInquiry")}
				</button>
			</div>
		</div>
	);
}
