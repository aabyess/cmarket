"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FileText, Loader2 } from "lucide-react";

type QuotePdfCardProps = {
	quoteId: string;
	docType: "quote" | "invoice";
	attachmentName: string | null;
	isMine: boolean;
};

const GENERATE_ENDPOINT: Record<QuotePdfCardProps["docType"], string> = {
	quote: "/api/chat/generate-quote-pdf",
	invoice: "/api/chat/generate-invoice-pdf",
};

type ResolvedDoc = {
	signedUrl: string;
	attachmentName: string;
};

export function QuotePdfCard({ quoteId, docType, attachmentName, isMine }: QuotePdfCardProps): React.ReactNode {
	const t = useTranslations("QuotePdfCard");
	const locale = useLocale();
	const [resolvedDoc, setResolvedDoc] = useState<ResolvedDoc | null>(null);
	const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
	const [thumbnailFailed, setThumbnailFailed] = useState(false);
	const [isOpening, setIsOpening] = useState(false);

	async function resolveDoc(): Promise<ResolvedDoc | null> {
		const res = await fetch(GENERATE_ENDPOINT[docType], {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ quoteId, locale }),
		});
		const data = await res.json();
		if (!res.ok) return null;
		return { signedUrl: data.signedUrl, attachmentName: data.attachmentName };
	}

	useEffect(() => {
		let cancelled = false;

		async function loadThumbnail(): Promise<void> {
			try {
				const doc = await resolveDoc();
				if (!doc || cancelled) {
					if (!cancelled) setThumbnailFailed(true);
					return;
				}
				if (!cancelled) setResolvedDoc(doc);

				const pdfjs = await import("pdfjs-dist");
				pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.mjs";

				const pdf = await pdfjs.getDocument({ url: doc.signedUrl }).promise;
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quoteId, docType, locale]);

	async function handleOpen(): Promise<void> {
		setIsOpening(true);
		try {
			const doc = resolvedDoc ?? (await resolveDoc());
			if (doc) {
				window.open(doc.signedUrl, "_blank", "noopener,noreferrer");
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
					<p className="truncate text-xs font-medium">
						{resolvedDoc?.attachmentName ?? attachmentName ?? t("defaultFileName")}
					</p>
					<p className={isMine ? "text-xs text-white/70" : "text-xs text-black/50"}>
						{isOpening ? t("opening") : t("openHint")}
					</p>
				</div>
			</div>
		</button>
	);
}
