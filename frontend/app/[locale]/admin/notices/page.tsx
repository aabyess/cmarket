import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAllNotices } from "@/features/support/serverApis";

export default async function AdminNoticesPage(): Promise<React.JSX.Element> {
	const notices = await getAllNotices();
	const t = await getTranslations("AdminNoticesPage");

	return (
		<div className="mx-auto max-w-[1100px] px-6 py-6 lg:px-8">
			<div className="mb-5 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
					<p className="mt-1 text-sm text-imsg-secondary">{t("count", { count: notices.length })}</p>
				</div>
				<Link
					href="/admin/notices/new"
					className="flex shrink-0 items-center gap-1.5 rounded-full bg-imsg-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-600">
					<Plus size={15} />
					{t("newNotice")}
				</Link>
			</div>

			{notices.length === 0 ? (
				<div className="rounded-2xl bg-white p-12 text-center shadow-sm">
					<p className="text-sm text-imsg-secondary">{t("empty")}</p>
				</div>
			) : (
				<div className="overflow-hidden rounded-2xl bg-white shadow-sm">
					<ul>
						{notices.map((notice, i) => (
							<li key={notice.id}>
								<Link
									href={`/admin/notices/${notice.id}`}
									className="flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-imsg-surface">
									<span
										className={
											notice.publishedAt
												? "shrink-0 rounded-full bg-[#F0FDF4] px-2 py-0.5 text-xs font-semibold text-[#16A34A]"
												: "shrink-0 rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-semibold text-[#6B7280]"
										}>
										{notice.publishedAt ? t("statusPublished") : t("statusDraft")}
									</span>
									{notice.isPinned && (
										<span className="shrink-0 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-semibold text-imsg-blue">
											{t("pinned")}
										</span>
									)}
									<span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0f172a]">
										{notice.title}
									</span>
									<span className="shrink-0 text-xs text-imsg-secondary">
										{new Date(notice.createdAt).toLocaleDateString("ko-KR")}
									</span>
								</Link>
								{i !== notices.length - 1 && <div className="mx-5 h-px bg-[#F2F2F7]" />}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
