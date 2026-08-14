import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdminNoticeForm } from "@/features/support/components/AdminNoticeForm";
import { getNotice } from "@/features/support/serverApis";

type EditNoticePageProps = {
	params: Promise<{ id: string }>;
};

export default async function EditNoticePage({
	params,
}: EditNoticePageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const notice = await getNotice(id);
	if (!notice) notFound();

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8">
			<Link
				href="/admin/notices"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				공지 목록으로
			</Link>

			<h1 className="mb-5 text-2xl font-bold tracking-tight text-[#0f172a]">공지 수정</h1>
			<AdminNoticeForm notice={notice} />
		</div>
	);
}
