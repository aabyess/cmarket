import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminNoticeForm } from "@/features/support/components/AdminNoticeForm";

export default function NewNoticePage(): React.JSX.Element {
	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8">
			<Link
				href="/admin/notices"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				공지 목록으로
			</Link>

			<h1 className="mb-5 text-2xl font-bold tracking-tight text-[#0f172a]">새 공지</h1>
			<AdminNoticeForm notice={null} />
		</div>
	);
}
