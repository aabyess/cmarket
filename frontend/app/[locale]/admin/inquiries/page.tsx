import { SupportInquiries } from "@/features/support/components/SupportInquiries";
import { getAllInquiries } from "@/features/support/inquiryApis";

export default async function AdminInquiriesPage(): Promise<React.JSX.Element> {
	const inquiries = await getAllInquiries();
	const openCount = inquiries.filter((inquiry) => inquiry.status === "OPEN").length;

	return (
		<div className="mx-auto max-w-[1100px] px-6 py-6 lg:px-8">
			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">1:1 문의</h1>
				<p className="mt-1 text-sm text-imsg-secondary">
					전체 {inquiries.length}건 · 답변 대기 {openCount}건
				</p>
			</div>

			<SupportInquiries inquiries={inquiries} showAuthor basePath="/admin/inquiries" />
		</div>
	);
}
