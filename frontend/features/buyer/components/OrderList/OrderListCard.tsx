"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Clock, MessageSquare, Package, Star } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Currency, ListingSummary } from "@/features/buyer/types";
import { getCategoryLabels } from "@/features/buyer/constants";
import {
	getDisplayListingStatus,
	type DisplayListingStatus,
} from "@/utils/getDisplayListingStatus";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const STATUS_STYLE: Record<DisplayListingStatus, { className: string; dotClassName: string }> = {
	active: { className: "bg-[#EFF6FF] text-imsg-blue", dotClassName: "bg-imsg-blue" },
	closed: { className: "bg-[#F3F4F6] text-muted", dotClassName: "bg-subtle" },
	awarded: { className: "bg-[#F0FDF4] text-[#16A34A]", dotClassName: "bg-[#16A34A]" },
	failed: { className: "bg-[#F3F4F6] text-muted", dotClassName: "bg-subtle" },
};

function getRemainingInfo(endDate: string): { isClosed: boolean; days: number; isUrgent: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	if (diff <= 0) return { isClosed: true, days: 0, isUrgent: false };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { isClosed: false, days, isUrgent: days <= 3 };
}

function formatDate(iso: string): string {
	const date = new Date(iso);
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

type OrderListCardProps = {
	listing: ListingSummary;
	onClick: () => void;
	onOpenBookmarks: () => void;
};

export function OrderListCard({
	listing,
	onClick,
	onOpenBookmarks,
}: OrderListCardProps): React.ReactNode {
	const t = useTranslations("OrderListCard");
	const categoryLabels = getCategoryLabels(useTranslations("ListingCategory"));
	const statusLabels: Record<DisplayListingStatus, string> = {
		active: t("statusActive"),
		closed: t("statusClosed"),
		awarded: t("statusAwarded"),
		failed: t("statusFailed"),
	};
	const displayStatus = getDisplayListingStatus(
		listing.status,
		listing.endDate,
		listing.status === "awarded",
	);
	const status = STATUS_STYLE[displayStatus];
	const symbol = CURRENCY_SYMBOL[listing.currency];
	const itemNames = listing.items
		.map((item) => item.name)
		.filter(Boolean)
		.join(", ");
	const remaining = getRemainingInfo(listing.endDate);
	const remainingText = remaining.isClosed
		? t("closed")
		: t("deadlineDays", { days: remaining.days });

	return (
		<div className="relative">
			{/* 카드 전체가 <button>이라 관심 기업 배지는 중첩 버튼을 피해 형제 요소로 절대 배치한다. */}
			{listing.bookmarkCount > 0 && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onOpenBookmarks();
					}}
					className="absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-xs font-semibold text-white shadow-md transition-colors hover:bg-amber-500">
					<Star size={11} fill="currentColor" />
					{listing.bookmarkCount}
				</button>
			)}
			<button
				onClick={onClick}
				className="border-hairline w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
				<div className="mb-2.5 flex items-center gap-2">
					<motion.span
						layoutId={`listing-status-${listing.id}`}
						transition={{ type: "spring", stiffness: 300, damping: 30 }}
						className={cn(
							"flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
							status.className,
						)}>
						<span className={cn("size-1.5 rounded-full", status.dotClassName)} />
						{statusLabels[displayStatus]}
					</motion.span>
					{listing.category && categoryLabels[listing.category] && (
						<span className="text-muted rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium">
							{categoryLabels[listing.category]}
						</span>
					)}
					<span
						className={cn(
							"ml-auto flex items-center gap-1 text-xs",
							remaining.isUrgent ? "font-medium text-[#DC2626]" : "text-subtle",
						)}>
						<Clock size={13} />
						{remainingText}
					</span>
				</div>

				<p className="text-ink text-sm font-semibold">{listing.title}</p>

				{itemNames && (
					<p className="text-muted mt-1 flex items-center gap-1.5 truncate text-xs">
						<Package size={13} className="shrink-0" />
						{itemNames}
					</p>
				)}

				<p className="text-subtle mt-1.5 text-xs">
					{t("registeredOn", { date: formatDate(listing.createdAt) })}
				</p>

				<div className="mt-3.5 flex items-center gap-5 border-t border-[#F3F4F6] pt-3.5">
					<div>
						<p className="text-subtle text-xs">{t("budgetLabel")}</p>
						<p className="text-ink text-xs font-semibold">
							{listing.budgetPublic
								? `${symbol} ${listing.totalBudget.toLocaleString()}`
								: t("budgetPrivate")}
						</p>
					</div>
					<div>
						<p className="text-subtle flex items-center gap-1 text-xs">
							<MessageSquare size={11} />
							{t("receivedQuotesLabel")}
						</p>
						<p className="text-ink text-xs font-semibold">
							{t("quoteCount", { count: listing.quoteCount })}
						</p>
					</div>
				</div>
			</button>
		</div>
	);
}
