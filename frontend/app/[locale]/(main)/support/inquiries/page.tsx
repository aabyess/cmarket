import { Link } from "@/i18n/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { SupportInquiries } from "@/features/support/components/SupportInquiries";
import { getMyInquiries } from "@/features/support/inquiryApis";

export default async function SupportInquiriesPage(): Promise<React.JSX.Element> {
	const inquiries = await getMyInquiries();

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				지원센터로
			</Link>

			<div className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">1:1 문의</h1>
					<p className="mt-1 text-sm text-imsg-secondary">문의 {inquiries.length}건</p>
				</div>

				<Link
					href="/support/inquiries/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-imsg-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600">
					<Plus size={15} />
					문의하기
				</Link>
			</div>

			<SupportInquiries inquiries={inquiries} />
		</div>
	);
}
