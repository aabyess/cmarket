// features/chat/components/ChatFileCard/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { File, Loader2 } from "lucide-react";

type ChatFileCardProps = {
	quoteId: string;
	attachmentUrl: string | null;
	attachmentName: string | null;
};

type SignedFileUrl = { url: string; size: number | null };

async function fetchSignedUrl(quoteId: string, storagePath: string): Promise<SignedFileUrl | null> {
	const params = new URLSearchParams({ quoteId, storagePath });
	const res = await fetch(`/api/chat/file-url?${params.toString()}`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.url ? { url: data.url, size: data.size ?? null } : null;
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function ChatFileCard({
	quoteId,
	attachmentUrl,
	attachmentName,
}: ChatFileCardProps): React.ReactNode {
	const t = useTranslations("ChatFileCard");
	const [size, setSize] = useState<number | null>(null);
	const [failed, setFailed] = useState(false);
	const [isOpening, setIsOpening] = useState(false);

	useEffect(() => {
		let cancelled = false;
		if (!attachmentUrl) {
			setFailed(true);
			return;
		}

		fetchSignedUrl(quoteId, attachmentUrl).then((result) => {
			if (cancelled) return;
			if (result) setSize(result.size);
			else setFailed(true);
		});

		return () => {
			cancelled = true;
		};
	}, [quoteId, attachmentUrl]);

	async function handleOpen(): Promise<void> {
		if (!attachmentUrl) return;
		setIsOpening(true);
		try {
			// 서명 URL은 10분이면 만료되므로 열 때는 새로 발급받는다.
			const result = await fetchSignedUrl(quoteId, attachmentUrl);
			if (result) {
				window.open(result.url, "_blank", "noopener,noreferrer");
			} else {
				alert(t("loadError"));
			}
		} finally {
			setIsOpening(false);
		}
	}

	return (
		<button
			onClick={handleOpen}
			disabled={isOpening || failed}
			className="flex w-64 items-center gap-3 rounded-[20px] bg-[#E9E9EB] px-4 py-3 text-left disabled:opacity-70">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[#6B7280]">
				{isOpening ? <Loader2 size={16} className="animate-spin" /> : <File size={16} />}
			</span>
			<span className="flex min-w-0 flex-col">
				<span className="truncate text-sm font-medium text-black">
					{attachmentName ?? t("defaultName")}
				</span>
				<span className="text-xs text-[#6B7280]">
					{failed ? t("loadError") : size !== null ? formatFileSize(size) : t("loading")}
				</span>
			</span>
		</button>
	);
}
