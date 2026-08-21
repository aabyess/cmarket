"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FileText, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type QuotePdfCardProps = {
	quoteId: string;
	docType: "quote" | "invoice";
	attachmentName: string | null;
	/** 원본 언어(견적서 PDF 스토리지 경로에 박혀 있는 언어)로 고정 표시할 때만 채워진다. */
	attachmentUrl: string | null;
	isMine: boolean;
	/** 같은 견적에서 처음 전송된 견적서 PDF인지. quote 타입에서만 원본/번역본 라벨에 쓰인다. */
	isOriginal: boolean;
};

const GENERATE_ENDPOINT: Record<QuotePdfCardProps["docType"], string> = {
	quote: "/api/chat/generate-quote-pdf",
	invoice: "/api/chat/generate-invoice-pdf",
};

type ResolvedDoc = {
	signedUrl: string;
	attachmentName: string;
};

function extractDocLocale(attachmentUrl: string | null): string | null {
	// 리비전 인지형 경로(quote-ko-1723456789.pdf)도, 구경로(quote-ko.pdf)도 잡는다.
	const match = attachmentUrl?.match(/quote-([a-z]{2,5})(?:-\d+)?\.pdf$/);
	return match?.[1] ?? null;
}

export function QuotePdfCard({
	quoteId,
	docType,
	attachmentName,
	attachmentUrl,
	isMine,
	isOriginal,
}: QuotePdfCardProps): React.ReactNode {
	const t = useTranslations("QuotePdfCard");
	const viewerLocale = useLocale();
	// 견적서(quote)는 전송 시점에 고정된 언어(원본/번역본)를 그대로 보여준다.
	// 보는 사람 언어로 다시 바뀌면 원본/번역본 구분이 무의미해지기 때문이다.
	const locale = docType === "quote" ? (extractDocLocale(attachmentUrl) ?? viewerLocale) : viewerLocale;
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
			// 마운트 시 받아둔 서명 URL은 10분이면 만료되므로 열 때마다 새로 발급받는다.
			const doc = await resolveDoc();
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
		<div className={cn("flex w-56 flex-col gap-1", isMine ? "items-end" : "items-start")}>
			{docType === "quote" && (
				<span
					className={cn(
						"rounded-full px-2.5 py-1 text-xs font-medium",
						isOriginal ? "bg-imsg-blue/10 text-imsg-blue" : "bg-[#F3F4F6] text-[#6B7280]",
					)}
				>
					{isOriginal ? t("originalBadge") : t("translationBadge")}
				</span>
			)}

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
						// canvas로 만든 data URL 썸네일이라 next/image 최적화 대상이 아니다
						// eslint-disable-next-line @next/next/no-img-element
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

			{docType === "quote" && !isOriginal && (
				<p className="max-w-56 text-xs text-[#9CA3AF]">{t("translationHint")}</p>
			)}
		</div>
	);
}
