"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import SectionWrapper from "@/features/buyer/components/PostListingForm/postListing/SectionWrapper";
import type { ListingAttachment, ListingFormData } from "@/features/buyer/types";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatFileSize(bytes: number): string {
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type ListingAttachmentSectionProps = {
	form: ListingFormData;
	onChange: (patch: Partial<ListingFormData>) => void;
};

export default function ListingAttachmentSection({ form, onChange }: ListingAttachmentSectionProps) {
	const t = useTranslations("ListingAttachmentSection");
	const [isUploading, setIsUploading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	async function uploadFiles(files: FileList): Promise<void> {
		const remaining = MAX_FILES - form.attachments.length;
		if (remaining <= 0) {
			alert(t("maxFilesError", { max: MAX_FILES }));
			return;
		}

		const targets = Array.from(files).slice(0, remaining);
		setIsUploading(true);

		try {
			const uploaded: ListingAttachment[] = [];

			for (const file of targets) {
				if (file.size > MAX_FILE_SIZE) {
                    alert(t("fileTooLarge", { fileName: file.name }));
                    continue;
                }

				const formData = new FormData();
				formData.append("file", file);

				const res = await fetch("/api/buyer/upload-listing-attachment", {
					method: "POST",
					body: formData,
				});

				if (!res.ok) {
					const { error } = await res.json();
					alert(t("uploadFailed", { fileName: file.name, error }));
					continue;
				}

				const data = await res.json();
				uploaded.push({
					id: crypto.randomUUID(),
					fileName: data.fileName,
					storagePath: data.storagePath,
					fileSize: data.fileSize,
				});
			}

			if (uploaded.length > 0) {
				onChange({ attachments: [...form.attachments, ...uploaded] });
			}
		} finally {
			setIsUploading(false);
		}
	}

	function handleRemove(id: string): void {
		onChange({ attachments: form.attachments.filter((a) => a.id !== id) });
	}

	function handleDrop(e: React.DragEvent<HTMLDivElement>): void {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
	}

	return (
		<SectionWrapper
            title={t("title")}
            subtitle={t("subtitle")}
        >
			<div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border py-10 text-center transition-colors ${
                    isDragging
                        ? "border-dashed border-imsg-blue bg-[#EFF6FF]"
                        : "border-[#E2E8F0] bg-[#F9FAFB] hover:border-dashed hover:border-imsg-blue"
                }`}
            >
				{isUploading ? (
					<Loader2 size={20} className="animate-spin text-imsg-blue" />
				) : (
					<Upload size={20} className="text-[#9CA3AF]" />
				)}
				<p className="text-sm text-[#374151]">{t("dropzoneText")}</p>
				<p className="text-xs text-[#9CA3AF]">{t("maxSize")}</p>
				<input
					ref={inputRef}
					type="file"
					multiple
					accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
					className="hidden"
					onChange={(e) => {
						if (e.target.files) uploadFiles(e.target.files);
						e.target.value = "";
					}}
				/>
			</div>

			{form.attachments.length > 0 && (
				<ul className="mt-3 space-y-1.5">
					{form.attachments.map((attachment) => (
						<li
							key={attachment.id}
							className="flex items-center justify-between gap-2 rounded-lg border border-[#E2E8F0] px-3 py-2.5"
						>
							<div className="flex min-w-0 items-center gap-2">
								<FileText size={15} className="shrink-0 text-[#9CA3AF]" />
								<span className="truncate text-sm text-[#374151]">{attachment.fileName}</span>
								<span className="shrink-0 text-xs text-[#9CA3AF]">
									{formatFileSize(attachment.fileSize)}
								</span>
							</div>
							<button
								onClick={() => handleRemove(attachment.id)}
								className="shrink-0 text-[#D1D5DB] transition-colors hover:text-[#EF4444]"
							>
								<X size={15} />
							</button>
						</li>
					))}
				</ul>
			)}
		</SectionWrapper>
	);
}