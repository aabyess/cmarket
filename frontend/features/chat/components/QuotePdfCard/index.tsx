"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FileText, Loader2 } from "lucide-react";

type QuotePdfCardProps = {
	attachmentUrl: string;
	attachmentName: string | null;
	isMine: boolean;
};

export function QuotePdfCard({ attachmentUrl, attachmentName, isMine }: QuotePdfCardProps): React.ReactNode {
	const t = useTranslations("QuotePdfCard");
	const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
	const [thumbnailFailed, setThumbnailFailed] = useState(false);
	const [isOpening, setIsOpening] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function loadThumbnail(): Promise<void> {
			try {
				const res = await fetch(`/api/chat/quote-pdf-url?path=${encodeURIComponent(attachmentUrl)}`);
				const data = await res.json();
				if (!res.ok || cancelled) return;

				const pdfjs = await import("pdfjs-dist");
				pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.mjs";

				const pdf = await pdfjs.getDocument({ url: data.url }).promise;
				const page = await pdf.getPage(1);
				const viewport = page.getViewport({ scale: 0.5 });

				const canvas = document.createElement("canvas");
				canvas.width = viewport.width;
				canvas.height = viewport.height;
				const context = canvas.getContext("2d");
				if (!context) return;

				await page.render({ canvasContext: context, viewport, canvas }).promise;
				if (!cancelled) setThumbnailUrl(canvas.toDataURL());
			} catch (err) {
				console.error("PDF 썸네일 생성 실패:", err);
				if (!cancelled) setThumbnailFailed(true);
			}
		}

		loadThumbnail();
		return () => {
			cancelled = true;
		};
	}, [attachmentUrl]);

	async function handleOpen(): Promise<void> {
		setIsOpening(true);
		try {
			const res = await fetch(`/api/chat/quote-pdf-url?path=${encodeURIComponent(attachmentUrl)}`);
			const data = await res.json();
			if (res.ok) {
				window.open(data.url, "_blank", "noopener,noreferrer");
			}
		} finally {
			setIsOpening(false);
		}
	}

	return (
		<button
			onClick={handleOpen}
			disabled={isOpening}
			className={
				isMine
					? "w-56 overflow-hidden rounded-[20px] bg-imsg-blue text-left text-white disabled:opacity-70"
					: "w-56 overflow-hidden rounded-[20px] bg-[#E9E9EB] text-left text-black disabled:opacity-70"
			}
		>
			<div className="flex h-40 items-center justify-center bg-white/90">
				{thumbnailUrl ? (
					<img src={thumbnailUrl} alt={t("previewAlt")} className="h-full w-full object-contain" />
				) : thumbnailFailed ? (
					<FileText size={28} className="text-[#9CA3AF]" />
				) : (
					<Loader2 size={20} className="animate-spin text-[#9CA3AF]" />
				)}
			</div>
			<div className="flex items-center gap-2.5 px-3.5 py-3">
				<div
					className={
						isMine
							? "flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20"
							: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-white"
					}
				>
					<FileText size={14} />
				</div>
				<div className="min-w-0">
					<p className="truncate text-xs font-medium">{attachmentName ?? t("defaultFileName")}</p>
					<p className={isMine ? "text-xs text-white/70" : "text-xs text-black/50"}>
						{isOpening ? t("opening") : t("openHint")}
					</p>
				</div>
			</div>
		</button>
	);
}