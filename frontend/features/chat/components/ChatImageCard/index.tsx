// features/chat/components/ChatImageCard/index.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ImageOff, Loader2 } from "lucide-react";

type ChatImageCardProps = {
	quoteId: string;
	attachmentUrl: string | null;
	attachmentName: string | null;
};

async function fetchSignedUrl(quoteId: string, storagePath: string): Promise<string | null> {
	const params = new URLSearchParams({ quoteId, storagePath });
	const res = await fetch(`/api/chat/image-url?${params.toString()}`);
	if (!res.ok) return null;
	const data = await res.json();
	return data.url ?? null;
}

export function ChatImageCard({
	quoteId,
	attachmentUrl,
	attachmentName,
}: ChatImageCardProps): React.ReactNode {
	const t = useTranslations("ChatImageCard");
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);
	const [isOpening, setIsOpening] = useState(false);

	useEffect(() => {
		let cancelled = false;
		if (!attachmentUrl) {
			setFailed(true);
			return;
		}

		fetchSignedUrl(quoteId, attachmentUrl).then((url) => {
			if (cancelled) return;
			if (url) setPreviewUrl(url);
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
			// 미리보기용 서명 URL은 10분이면 만료되므로 열 때는 새로 발급받는다.
			const url = await fetchSignedUrl(quoteId, attachmentUrl);
			if (url) {
				window.open(url, "_blank", "noopener,noreferrer");
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
			className="flex h-40 w-56 items-center justify-center overflow-hidden rounded-[20px] bg-[#E9E9EB] disabled:opacity-70"
		>
			{previewUrl ? (
				// 서명 URL이라 next/image 원격 도메인 등록 대상이 아니다
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={previewUrl}
					alt={attachmentName ?? t("previewAlt")}
					className="h-full w-full object-cover"
				/>
			) : failed ? (
				<div className="flex flex-col items-center gap-1 text-[#9CA3AF]">
					<ImageOff size={24} />
					<span className="text-xs">{t("loadError")}</span>
				</div>
			) : (
				<Loader2 size={20} className="animate-spin text-[#9CA3AF]" />
			)}
		</button>
	);
}
