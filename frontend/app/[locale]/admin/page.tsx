import { Link } from "@/i18n/navigation";
import { ArrowRight, FileCheck, FileText, FolderOpen, Mail, Receipt, Users } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import {
	getAdminDashboardStats,
	getAllNotices,
	getAllResources,
	getRecentCompanies,
} from "@/features/support/serverApis";
import { getAllInquiries } from "@/features/support/inquiryApis";
import { getAllContracts } from "@/features/contract/apis";
import { CURRENCY_SYMBOL } from "@/features/buyer/constants";
import type { Currency } from "@/features/buyer/types";

const RECENT_LIMIT = 5;

export default async function AdminHomePage(): Promise<React.JSX.Element> {
	const [stats, recentCompanies, recentContracts, notices, resources, inquiries, locale, t] = await Promise.all([
		getAdminDashboardStats(),
		getRecentCompanies(RECENT_LIMIT),
		getAllContracts(RECENT_LIMIT),
		getAllNotices(),
		getAllResources(),
		getAllInquiries(),
		getLocale(),
		getTranslations("AdminDashboardPage"),
	]);

	const openCount = inquiries.filter((inquiry) => inquiry.status === "OPEN").length;

	const platformCards: {
		href: string | null;
		label: string;
		value: string;
		sub: string | null;
		icon: typeof Users;
		accent: boolean;
	}[] = [
		{
			href: "/admin/users",
			label: t("memberCard"),
			value: t("totalCount", { count: stats.memberTotal }),
			sub: t("memberCardSub", { buyer: stats.buyerCount, seller: stats.sellerCount }),
			icon: Users,
			accent: false,
		},
		{
			href: null,
			label: t("listingCard"),
			value: t("totalCount", { count: stats.listingTotal }),
			sub: t("listingCardSub", { active: stats.listingActiveCount, closed: stats.listingClosedCount }),
			icon: FileText,
			accent: false,
		},
		{
			href: null,
			label: t("quoteCard"),
			value: t("totalCount", { count: stats.quoteTotal }),
			sub: null,
			icon: Receipt,
			accent: false,
		},
		{
			href: "/admin/contracts",
			label: t("contractCard"),
			value: t("totalCount", { count: stats.contractTotal }),
			sub: t("contractCardSub", { ongoing: stats.contractOngoingCount, completed: stats.contractCompletedCount }),
			icon: FileCheck,
			accent: false,
		},
	];

	const operationCards = [
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

			<div className="mb-6">
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-imsg-secondary">
					{t("sectionPlatformStats")}
				</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{platformCards.map((card) => {
						const content = (
							<>
								<span className="flex items-center justify-between">
									<card.icon size={17} className="text-imsg-secondary" />
									{card.href && <ArrowRight size={14} className="text-[#D1D5DB]" />}
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
								{card.sub && <p className="mt-0.5 text-xs text-imsg-secondary">{card.sub}</p>}
							</>
						);

						return card.href ? (
							<Link
								key={card.label}
								href={card.href}
								className="rounded-2xl bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
								{content}
							</Link>
						) : (
							<div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
								{content}
							</div>
						);
					})}
				</div>
			</div>

			<div className="mb-6">
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-imsg-secondary">
					{t("sectionOperations")}
				</h2>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{operationCards.map((card) => (
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

			<div>
				<h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-imsg-secondary">
					{t("recentActivityTitle")}
				</h2>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<div className="rounded-2xl bg-white shadow-sm">
						<div className="flex items-center justify-between px-5 py-4">
							<h3 className="text-sm font-semibold text-[#0f172a]">{t("recentCompaniesTitle")}</h3>
							<Link href="/admin/users" className="text-xs font-medium text-imsg-blue hover:underline">
								{t("viewAll")}
							</Link>
						</div>
						<div className="h-px bg-[#F2F2F7]" />
						{recentCompanies.length === 0 ? (
							<p className="px-5 py-8 text-center text-sm text-imsg-secondary">{t("recentCompaniesEmpty")}</p>
						) : (
							<ul className="divide-y divide-[#F2F2F7]">
								{recentCompanies.map((company) => (
									<li key={company.id}>
										<Link
											href="/admin/users"
											className="flex items-center justify-between gap-3 px-5 py-3 transition-colors duration-200 hover:bg-imsg-surface">
											<div className="min-w-0">
												<p className="truncate text-sm font-medium text-[#1F2937]">{company.companyName}</p>
												<p className="mt-0.5 text-xs text-imsg-secondary">
													{company.role === "seller" ? t("roleSeller") : t("roleBuyer")}
												</p>
											</div>
											<span className="shrink-0 text-xs text-imsg-secondary">
												{new Date(company.createdAt).toLocaleDateString(locale)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						)}
					</div>

					<div className="rounded-2xl bg-white shadow-sm">
						<div className="flex items-center justify-between px-5 py-4">
							<h3 className="text-sm font-semibold text-[#0f172a]">{t("recentContractsTitle")}</h3>
							<Link href="/admin/contracts" className="text-xs font-medium text-imsg-blue hover:underline">
								{t("viewAll")}
							</Link>
						</div>
						<div className="h-px bg-[#F2F2F7]" />
						{recentContracts.length === 0 ? (
							<p className="px-5 py-8 text-center text-sm text-imsg-secondary">{t("recentContractsEmpty")}</p>
						) : (
							<ul className="divide-y divide-[#F2F2F7]">
								{recentContracts.map((contract) => (
									<li key={contract.id}>
										<Link
											href="/admin/contracts"
											className="flex items-center justify-between gap-3 px-5 py-3 transition-colors duration-200 hover:bg-imsg-surface">
											<div className="min-w-0">
												<p className="truncate text-sm font-medium text-[#1F2937]">
													{contract.listing.title}
												</p>
												<p className="mt-0.5 text-xs text-imsg-secondary">
													{CURRENCY_SYMBOL[contract.quote.currency as Currency]}{" "}
													{contract.quote.price.toLocaleString()}
												</p>
											</div>
											<span className="shrink-0 text-xs text-imsg-secondary">
												{new Date(contract.createdAt).toLocaleDateString(locale)}
											</span>
										</Link>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
