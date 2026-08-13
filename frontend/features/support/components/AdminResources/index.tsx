"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import type { SupportResource } from "@/features/support/types";

type AdminResourcesProps = {
	resources: SupportResource[];
};

const INPUT_CLASS =
	"w-full rounded-lg border border-[#E5E7EB] px-3.5 py-2.5 text-sm text-[#0f172a] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue";

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AdminResources({ resources }: AdminResourcesProps): React.JSX.Element {
	const router = useRouter();
	const fileRef = useRef<HTMLInputElement>(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [fileName, setFileName] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	async function handleUpload(): Promise<void> {
		const file = fileRef.current?.files?.[0];
		if (!file || title.trim().length === 0) return;

		setIsSaving(true);
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("title", title);
			formData.append("description", description);

			const res = await fetch("/api/admin/resource", { method: "POST", body: formData });
			if (!res.ok) {
				const { error } = await res.json();
				alert(error ?? "업로드에 실패했습니다.");
				return;
			}

			setTitle("");
			setDescription("");
			setFileName("");
			if (fileRef.current) fileRef.current.value = "";
			router.refresh();
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete(id: string): Promise<void> {
		const res = await fetch(`/api/admin/resource?id=${id}`, { method: "DELETE" });
		if (!res.ok) {
			const { error } = await res.json();
			alert(error ?? "삭제에 실패했습니다.");
			return;
		}
		router.refresh();
	}

	return (
		<div className="space-y-5">
			<div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
				<h2 className="text-base font-semibold text-[#0f172a]">새 자료 올리기</h2>

				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="자료 제목 (예: 2026 계약 보증금 면제각서 양식)"
					className={INPUT_CLASS}
				/>
				<input
					type="text"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="설명 (선택)"
					className={INPUT_CLASS}
				/>

				<div className="flex items-center gap-3">
					<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#374151] transition-colors duration-200 hover:bg-imsg-surface">
						<Upload size={14} />
						파일 선택
						<input
							ref={fileRef}
							type="file"
							className="hidden"
							onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
						/>
					</label>
					<span className="min-w-0 flex-1 truncate text-sm text-imsg-secondary">
						{fileName || "선택된 파일 없음"}
					</span>
				</div>

				<button
					type="button"
					onClick={handleUpload}
					disabled={!fileName || title.trim().length === 0 || isSaving}
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-imsg-blue py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600 disabled:opacity-40">
					{isSaving && <Loader2 size={15} className="animate-spin" />}
					업로드
				</button>
			</div>

			{resources.length === 0 ? (
				<div className="rounded-2xl bg-white p-12 text-center shadow-sm">
					<p className="text-sm text-imsg-secondary">등록된 자료가 없어요</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl bg-white shadow-sm">
					<ul>
						{resources.map((resource, i) => (
							<li key={resource.id}>
								<div className="flex items-center gap-3 px-5 py-4">
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-medium text-[#0f172a]">
											{resource.title}
										</span>
										<span className="block truncate text-xs text-imsg-secondary">
											{resource.fileName} · {formatSize(resource.fileSize)} · 다운로드{" "}
											{resource.downloadCount}
										</span>
									</span>
									<button
										type="button"
										onClick={() => handleDelete(resource.id)}
										aria-label="자료 삭제"
										className="shrink-0 text-[#9CA3AF] transition-colors duration-200 hover:text-[#DC2626]">
										<Trash2 size={15} />
									</button>
								</div>
								{i !== resources.length - 1 && <div className="mx-5 h-px bg-[#F2F2F7]" />}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
