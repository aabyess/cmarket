import { Link } from "@/i18n/navigation";
import { cva } from "class-variance-authority";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getInquiryCategoryLabels, getInquiryStatusLabels } from "@/features/support/constants";
import type { Inquiry } from "@/features/support/types";

type SupportInquiriesProps = {
	inquiries: Inquiry[];
	/** 운영자 목록에서는 문의자를 함께 보여준다. */
	showAuthor?: boolean;
	basePath?: string;
};

const statusChip = cva("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", {
	variants: {
		status: {
			OPEN: "bg-[#FFFBEB] text-[#D97706]",
			ANSWERED: "bg-[#F0FDF4] text-[#16A34A]",
			CLOSED: "bg-[#F3F4F6] text-[#6B7280]",
		},
	},
	defaultVariants: { status: "OPEN" },
});

export async function SupportInquiries({
	inquiries,
	showAuthor = false,
	basePath = "/support/inquiries",
}: SupportInquiriesProps): Promise<React.JSX.Element> {
	const t = await getTranslations("SupportInquiries");
	const inquiryStatusLabels = getInquiryStatusLabels(await getTranslations("InquiryStatusLabel"));
	const inquiryCategoryLabels = getInquiryCategoryLabels(await getTranslations("InquiryCategoryLabel"));

	if (inquiries.length === 0) {
		return (
			<div className="rounded-2xl bg-white p-12 text-center shadow-sm">
				<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
					<Mail size={20} className="text-imsg-secondary" />
				</div>
				<p className="text-base font-medium text-[#0f172a]">{t("emptyTitle")}</p>
				<p className="mt-1 text-sm text-imsg-secondary">{t("emptyDescription")}</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl bg-white shadow-sm">
			<ul>
				{inquiries.map((inquiry, i) => (
					<li key={inquiry.id}>
						<Link
							href={`${basePath}/${inquiry.id}`}
							className="flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-imsg-surface">
							<span className={statusChip({ status: inquiry.status })}>
								{inquiryStatusLabels[inquiry.status]}
							</span>
							<span className="shrink-0 rounded-full bg-imsg-surface px-2 py-0.5 text-xs font-medium text-imsg-secondary">
								{inquiryCategoryLabels[inquiry.category]}
							</span>

							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-medium text-[#0f172a]">
									{inquiry.title}
								</span>
								{showAuthor && (
									<span className="block truncate text-xs text-imsg-secondary">
										{inquiry.authorCompanyName} · {inquiry.authorName}
									</span>
								)}
							</span>

							{inquiry.replies.length > 0 && (
								<span className="shrink-0 text-xs text-imsg-secondary">
									{t("replyCount", { count: inquiry.replies.length })}
								</span>
							)}
							<span className="shrink-0 text-xs text-imsg-secondary">
								{new Date(inquiry.createdAt).toLocaleDateString("ko-KR")}
							</span>
						</Link>
						{i !== inquiries.length - 1 && <div className="mx-5 h-px bg-[#F2F2F7]" />}
					</li>
				))}
			</ul>
		</div>
	);
}
