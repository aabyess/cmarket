import { Link } from "@/i18n/navigation";
import { ArrowRight, FileText, FolderOpen, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAllNotices, getAllResources } from "@/features/support/serverApis";
import { getAllInquiries } from "@/features/support/inquiryApis";

export default async function AdminHomePage(): Promise<React.JSX.Element> {
	const [notices, resources, inquiries, t] = await Promise.all([
		getAllNotices(),
		getAllResources(),
		getAllInquiries(),
		getTranslations("AdminDashboardPage"),
	]);

	const openCount = inquiries.filter((inquiry) => inquiry.status === "OPEN").length;

	const cards = [
		{
			href: "/admin/inquiries",
			label: t("pendingInquiries"),
			value: t("countUnit", { count: openCount }),
			sub: t("totalCount", { count: inquiries.length }),
			icon: Mail,
			accent: openCount > 0,
		},
		{
			href: "/admin/notices",
			label: t("notices"),
			value: t("publishedCount", { count: notices.filter((n) => n.publishedAt).length }),
			sub: t("draftCount", { count: notices.filter((n) => !n.publishedAt).length }),
			icon: FileText,
			accent: false,
		},
		{
			href: "/admin/resources",
			label: t("resources"),
			value: t("publishedCount", { count: resources.filter((r) => r.publishedAt).length }),
			sub: t("draftCount", { count: resources.filter((r) => !r.publishedAt).length }),
			icon: FolderOpen,
			accent: false,
		},
	];

	return (
		<div className="mx-auto max-w-[1100px] px-6 py-6 lg:px-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{t("subtitle")}</p>
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
