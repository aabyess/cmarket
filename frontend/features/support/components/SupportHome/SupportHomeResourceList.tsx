// features/support/components/SupportHome/SupportHomeResourceList.tsx
"use client";

import type { SupportResource } from "@/features/support/types";

type SupportHomeResourceListProps = {
	resources: SupportResource[];
	formatDate: (iso: string | null) => string;
};

export function SupportHomeResourceList({
	resources,
	formatDate,
}: SupportHomeResourceListProps): React.JSX.Element {
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

	return (
		<ul className="p-2">
			{resources.map((resource) => (
				<li key={resource.id}>
					<button
						type="button"
						onClick={() => handleDownload(resource.id)}
						className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-imsg-surface"
					>
						<span className="min-w-0 flex-1 truncate text-sm text-[#0f172a]">
							{resource.title}
						</span>
						<span className="shrink-0 text-xs text-imsg-secondary">
							{formatDate(resource.publishedAt)}
						</span>
					</button>
				</li>
			))}
		</ul>
	);
}
