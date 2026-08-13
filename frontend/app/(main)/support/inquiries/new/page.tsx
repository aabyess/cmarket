import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SupportInquiryForm } from "@/features/support/components/SupportInquiries/SupportInquiryForm";

export default function NewInquiryPage(): React.JSX.Element {
	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support/inquiries"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				문의 내역으로
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">1:1 문의하기</h1>
				<p className="mt-1 text-sm text-imsg-secondary">
					답변이 등록되면 알림으로 알려드릴게요. 보통 영업일 기준 1일 내에 답변드립니다.
				</p>
			</div>

			<SupportInquiryForm />
		</div>
	);
}
