import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getNotice } from "@/features/support/serverApis";

type NoticeDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function NoticeDetailPage({
	params,
}: NoticeDetailPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const notice = await getNotice(id);
	if (!notice) notFound();

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support/notices"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				공지사항으로
			</Link>

			<article className="rounded-2xl bg-white p-8 shadow-sm">
				<div className="mb-2 flex items-center gap-2">
					{notice.isPinned && (
						<span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-imsg-blue">
							중요
						</span>
					)}
					<span className="text-xs text-imsg-secondary">
						{notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString("ko-KR") : ""}
					</span>
				</div>

				<h1 className="text-xl font-bold tracking-tight text-[#0f172a]">{notice.title}</h1>

				<div className="mt-6 whitespace-pre-wrap border-t border-[#F2F2F7] pt-6 text-sm leading-relaxed text-[#374151]">
					{notice.content}
				</div>
			</article>
		</div>
	);
}
