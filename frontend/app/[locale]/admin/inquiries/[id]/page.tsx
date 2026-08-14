import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SupportInquiryDetail } from "@/features/support/components/SupportInquiries/SupportInquiryDetail";
import { getInquiry } from "@/features/support/inquiryApis";

type AdminInquiryDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function AdminInquiryDetailPage({
	params,
}: AdminInquiryDetailPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const inquiry = await getInquiry(id);
	if (!inquiry) notFound();

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8">
			<Link
				href="/admin/inquiries"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				문의 목록으로
			</Link>

			{/* 이 페이지는 레이아웃에서 운영자만 통과시킨다. */}
			<SupportInquiryDetail inquiry={inquiry} isAdmin />
		</div>
	);
}
