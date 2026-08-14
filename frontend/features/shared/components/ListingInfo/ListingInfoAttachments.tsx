"use client";

import { useTranslations } from "next-intl";
import { Download, Paperclip } from "lucide-react";
import type { ListingAttachment } from "@/features/buyer/types";

type ListingInfoAttachmentsProps = {
	listingId: string;
	attachments: ListingAttachment[];
};

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ListingInfoAttachments({
	listingId,
	attachments,
}: ListingInfoAttachmentsProps): React.JSX.Element | null {
	const t = useTranslations("ListingInfoAttachments");

	if (attachments.length === 0) return null;

	async function handleOpen(storagePath: string): Promise<void> {
		try {
			const res = await fetch(
				`/api/buyer/attachment-url?listingId=${listingId}&storagePath=${encodeURIComponent(storagePath)}`,
			);
			if (!res.ok) throw new Error("URL 생성 실패");
			const { url } = await res.json();
			window.open(url, "_blank");
		} catch {
			alert(t("openError"));
		}
	}

	return (
		<section className="rounded-2xl bg-white p-6 shadow-sm">
			<h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#0f172a]">
				<Paperclip size={16} className="text-imsg-secondary" />
				{t("heading")}
				<span className="rounded-full bg-imsg-surface px-2 py-0.5 text-xs font-medium text-imsg-secondary">
					{attachments.length}
				</span>
			</h2>

			<ul className="space-y-2">
				{attachments.map((attachment) => (
					<li key={attachment.id}>
						<button
							type="button"
							onClick={() => handleOpen(attachment.storagePath)}
							className="flex w-full items-center gap-3 rounded-xl border border-[#F2F2F7] px-4 py-3 text-left transition-colors duration-200 hover:bg-imsg-surface">
							<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
								<Download size={14} className="text-imsg-blue" />
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-medium text-[#0f172a]">
									{attachment.fileName}
								</span>
								<span className="block text-xs text-imsg-secondary">
									{formatSize(attachment.fileSize)}
								</span>
							</span>
						</button>
					</li>
				))}
			</ul>
		</section>
	);
}
