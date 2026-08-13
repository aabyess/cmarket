import Link from "next/link";
import { FileText } from "lucide-react";
import type { Notice } from "@/features/support/types";

type SupportNoticesProps = {
	notices: Notice[];
};

export function SupportNotices({ notices }: SupportNoticesProps): React.JSX.Element {
	if (notices.length === 0) {
		return (
			<div className="rounded-2xl bg-white p-12 text-center shadow-sm">
				<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
					<FileText size={20} className="text-imsg-secondary" />
				</div>
				<p className="text-base font-medium text-[#0f172a]">등록된 공지가 없어요</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl bg-white shadow-sm">
			<ul>
				{notices.map((notice, i) => (
					<li key={notice.id}>
						<Link
							href={`/support/notices/${notice.id}`}
							className="flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-imsg-surface">
							{notice.isPinned && (
								<span className="shrink-0 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-imsg-blue">
									중요
								</span>
							)}
							<span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0f172a]">
								{notice.title}
							</span>
							<span className="shrink-0 text-xs text-imsg-secondary">
								{notice.publishedAt
									? new Date(notice.publishedAt).toLocaleDateString("ko-KR")
									: ""}
							</span>
						</Link>
						{i !== notices.length - 1 && <div className="mx-5 h-px bg-[#F2F2F7]" />}
					</li>
				))}
			</ul>
		</div>
	);
}
