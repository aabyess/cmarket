import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SupportInquiryDetail } from "@/features/support/components/SupportInquiries/SupportInquiryDetail";
import { getInquiry } from "@/features/support/inquiryApis";
import { getIsAdmin } from "@/features/support/serverApis";

type InquiryDetailPageProps = {
	params: Promise<{ id: string }>;
};

export default async function InquiryDetailPage({
	params,
}: InquiryDetailPageProps): Promise<React.JSX.Element> {
	const { id } = await params;
	const [inquiry, isAdmin] = await Promise.all([getInquiry(id), getIsAdmin()]);
	if (!inquiry) notFound();

	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support/inquiries"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				문의 내역으로
			</Link>

			<SupportInquiryDetail inquiry={inquiry} isAdmin={isAdmin} />
		</div>
	);
}
