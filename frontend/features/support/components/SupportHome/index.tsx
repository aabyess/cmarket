import { Link } from "@/i18n/navigation";
import { ArrowRight, FileText, FolderOpen, HelpCircle, Mail } from "lucide-react";
import { cva } from "class-variance-authority";
import { SupportHomeResourceList } from "@/features/support/components/SupportHome/SupportHomeResourceList";
import { getTranslations } from "next-intl/server";
import type { Notice, SupportResource } from "@/features/support/types";

type SupportHomeProps = {
	notices: Notice[];
	resources: SupportResource[];
	openInquiryCount: number;
};

const menuCard = cva(
	"flex items-center gap-3 rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-0.5",
	{
		variants: {
			tone: {
				notice: "bg-[#EEF2FF]",
				resource: "bg-[#FFF7ED]",
				faq: "bg-[#EFF6FF]",
				inquiry: "bg-[#ECFDF5]",
			},
		},
		defaultVariants: { tone: "notice" },
	},
);

const menuIcon = cva("flex size-10 shrink-0 items-center justify-center rounded-xl bg-white", {
	variants: {
		tone: {
			notice: "text-[#4F46E5]",
			resource: "text-[#EA580C]",
			faq: "text-imsg-blue",
			inquiry: "text-[#059669]",
		},
	},
	defaultVariants: { tone: "notice" },
});

function formatDate(value: string | null): string {
	return value ? new Date(value).toLocaleDateString("ko-KR") : "";
}

export async function SupportHome({
	notices,
	resources,
	openInquiryCount,
}: SupportHomeProps): Promise<React.JSX.Element> {
	const t = await getTranslations("SupportHome");

	const MENUS = [
		{
			href: "/support/notices",
			label: t("noticesLabel"),
			description: t("noticesDescription"),
			icon: FileText,
			tone: "notice" as const,
		},
		{
			href: "/support/resources",
			label: t("resourcesLabel"),
			description: t("resourcesDescription"),
			icon: FolderOpen,
			tone: "resource" as const,
		},
		{
			href: "/support/faq",
			label: t("faqLabel"),
			description: t("faqDescription"),
			icon: HelpCircle,
			tone: "faq" as const,
		},
		{
			href: "/support/inquiries",
			label: t("inquiryLabel"),
			description: t("inquiryDescription"),
			icon: Mail,
			tone: "inquiry" as const,
		},
	];

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8 xl:px-10">
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("heroTitle")}</h1>
				<p className="mt-1.5 text-sm text-imsg-secondary">{t("heroDescription")}</p>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{MENUS.map((menu) => (
					<Link key={menu.href} href={menu.href} className={menuCard({ tone: menu.tone })}>
						<span className={menuIcon({ tone: menu.tone })}>
							<menu.icon size={18} />
						</span>
						<span className="min-w-0">
							<span className="block text-sm font-semibold text-[#0f172a]">
								{menu.label}
								{menu.tone === "inquiry" && openInquiryCount > 0 && (
									<span className="ml-1.5 rounded-full bg-[#059669] px-1.5 py-0.5 text-xs text-white">
										{openInquiryCount}
									</span>
								)}
							</span>
							<span className="block text-xs text-imsg-secondary">{menu.description}</span>
						</span>
					</Link>
				))}
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<section className="rounded-2xl bg-white shadow-sm">
					<div className="flex items-center justify-between px-5 py-4">
						<h2 className="text-base font-semibold text-[#0f172a]">{t("noticesLabel")}</h2>
						<Link
							href="/support/notices"
							className="flex items-center gap-1 text-xs font-medium text-imsg-blue hover:underline">
							{t("viewMore")}
							<ArrowRight size={11} />
						</Link>
					</div>
					<div className="h-px bg-[#F2F2F7]" />

					{notices.length === 0 ? (
						<p className="py-10 text-center text-sm text-imsg-secondary">{t("noticesEmpty")}</p>
					) : (
						<ul className="p-2">
							{notices.map((notice) => (
								<li key={notice.id}>
									<Link
										href={`/support/notices/${notice.id}`}
										className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-imsg-surface">
										{notice.isPinned && (
											<span className="shrink-0 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-imsg-blue">
												{t("pinnedBadge")}
											</span>
										)}
										<span className="min-w-0 flex-1 truncate text-sm text-[#0f172a]">
											{notice.title}
										</span>
										<span className="shrink-0 text-xs text-imsg-secondary">
											{formatDate(notice.publishedAt)}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>

				<section className="rounded-2xl bg-white shadow-sm">
					<div className="flex items-center justify-between px-5 py-4">
						<h2 className="text-base font-semibold text-[#0f172a]">{t("resourcesLabel")}</h2>
						<Link
							href="/support/resources"
							className="flex items-center gap-1 text-xs font-medium text-imsg-blue hover:underline">
							{t("viewMore")}
							<ArrowRight size={11} />
						</Link>
					</div>
					<div className="h-px bg-[#F2F2F7]" />

					{resources.length === 0 ? (
						<p className="py-10 text-center text-sm text-imsg-secondary">{t("resourcesEmpty")}</p>
					) : (
						<SupportHomeResourceList resources={resources} formatDate={formatDate} />
					)}
				</section>
			</div>
		</div>
	);
}
