import { Link } from "@/i18n/navigation";
import { ArrowRight, FileText, FolderOpen, Mail } from "lucide-react";
import { getAllNotices, getAllResources } from "@/features/support/serverApis";
import { getAllInquiries } from "@/features/support/inquiryApis";

export default async function AdminHomePage(): Promise<React.JSX.Element> {
	const [notices, resources, inquiries] = await Promise.all([
		getAllNotices(),
		getAllResources(),
		getAllInquiries(),
	]);

	const openCount = inquiries.filter((inquiry) => inquiry.status === "OPEN").length;

	const cards = [
		{
			href: "/admin/inquiries",
			label: "답변 대기 문의",
			value: `${openCount}건`,
			sub: `전체 ${inquiries.length}건`,
			icon: Mail,
			accent: openCount > 0,
		},
		{
			href: "/admin/notices",
			label: "공지사항",
			value: `${notices.filter((n) => n.publishedAt).length}건 발행`,
			sub: `임시저장 ${notices.filter((n) => !n.publishedAt).length}건`,
			icon: FileText,
			accent: false,
		},
		{
			href: "/admin/resources",
			label: "자료실",
			value: `${resources.filter((r) => r.publishedAt).length}건 발행`,
			sub: `임시저장 ${resources.filter((r) => !r.publishedAt).length}건`,
			icon: FolderOpen,
			accent: false,
		},
	];

	return (
		<div className="mx-auto max-w-[1100px] px-6 py-6 lg:px-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">운영자 대시보드</h1>
				<p className="mt-1 text-sm text-imsg-secondary">지원센터 콘텐츠와 문의를 관리합니다</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{cards.map((card) => (
					<Link
						key={card.href}
						href={card.href}
						className="rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
						<span className="flex items-center justify-between">
							<card.icon size={17} className="text-imsg-secondary" />
							<ArrowRight size={14} className="text-[#D1D5DB]" />
						</span>
						<p className="mt-3 text-sm text-imsg-secondary">{card.label}</p>
						<p
							className={
								card.accent
									? "mt-0.5 text-2xl font-bold tracking-tight text-imsg-blue"
									: "mt-0.5 text-2xl font-bold tracking-tight text-[#0f172a]"
							}>
							{card.value}
						</p>
						<p className="mt-0.5 text-xs text-imsg-secondary">{card.sub}</p>
					</Link>
				))}
			</div>
		</div>
	);
}
