"use client";

import { Download, FolderOpen } from "lucide-react";
import type { SupportResource } from "@/features/support/types";

type SupportResourcesProps = {
	resources: SupportResource[];
};

function formatSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function SupportResources({ resources }: SupportResourcesProps): React.JSX.Element {
	async function handleDownload(resourceId: string): Promise<void> {
		try {
			const res = await fetch(`/api/support/resource-url?resourceId=${resourceId}`);
			if (!res.ok) throw new Error("URL 생성 실패");
			const { url } = await res.json();
			window.open(url, "_blank");
		} catch {
			alert("자료를 여는 중 오류가 발생했습니다.");
		}
	}

	if (resources.length === 0) {
		return (
			<div className="rounded-2xl bg-white p-12 text-center shadow-sm">
				<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
					<FolderOpen size={20} className="text-imsg-secondary" />
				</div>
				<p className="text-base font-medium text-[#0f172a]">등록된 자료가 없어요</p>
			</div>
		);
	}

	return (
		<ul className="space-y-2">
			{resources.map((resource) => (
				<li key={resource.id}>
					<button
						type="button"
						onClick={() => handleDownload(resource.id)}
						className="flex w-full items-center gap-4 rounded-2xl bg-white px-5 py-4 text-left shadow-sm transition-shadow duration-200 hover:shadow-md">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF7ED]">
							<Download size={17} className="text-[#EA580C]" />
						</span>

						<span className="min-w-0 flex-1">
							<span className="block truncate text-sm font-semibold text-[#0f172a]">
								{resource.title}
							</span>
							{resource.description && (
								<span className="mt-0.5 block truncate text-xs text-imsg-secondary">
									{resource.description}
								</span>
							)}
							<span className="mt-1 block text-xs text-imsg-secondary">
								{resource.fileName} · {formatSize(resource.fileSize)}
								{resource.publishedAt &&
									` · ${new Date(resource.publishedAt).toLocaleDateString("ko-KR")}`}
							</span>
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}
