import { Link } from "@/i18n/navigation";
import { ChevronLeft } from "lucide-react";
import { SupportFaq } from "@/features/support/components/SupportFaq";

export default function SupportFaqPage(): React.JSX.Element {
	return (
		<div className="mx-auto max-w-[900px] px-6 py-6 lg:px-8 xl:px-10">
			<Link
				href="/support"
				className="mb-4 inline-flex items-center gap-1.5 text-sm text-imsg-secondary transition-colors duration-200 hover:text-[#374151]">
				<ChevronLeft size={16} />
				지원센터로
			</Link>

			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">자주 묻는 질문</h1>
				<p className="mt-1 text-sm text-imsg-secondary">
					찾는 답이 없으면 1:1 문의를 남겨 주세요.
				</p>
			</div>

			<SupportFaq />
		</div>
	);
}
