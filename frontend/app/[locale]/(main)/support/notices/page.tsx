import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { SupportNotices } from "@/features/support/components/SupportNotices";
import { getNotices } from "@/features/support/serverApis";

export default async function SupportNoticesPage(): Promise<React.JSX.Element> {
	const notices = await getNotices();

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				지원센터로
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">공지사항</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{notices.length}건</p>
			</div>

			<SupportNotices notices={notices} />
		</div>
	);
}
