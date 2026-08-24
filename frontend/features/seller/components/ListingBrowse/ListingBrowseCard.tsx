"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Clock, CalendarDays, Package, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { ListingBookmarkButton } from "@/features/seller/components/ListingBookmarkButton";
import type { Currency } from "@/features/buyer/types";
import type { OpenListing } from "@/features/seller/types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

function getRemaining(
	endDate: string,
	status: OpenListing["status"],
): { days: number; isUrgent: boolean; isClosed: boolean } {
	const diff = new Date(endDate).getTime() - Date.now();
	const isClosed = status !== "active" || diff <= 0;

	if (isClosed) return { days: 0, isUrgent: false, isClosed: true };

	const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
	return { days, isUrgent: days <= 3, isClosed: false };
}

type ListingBrowseCardProps = {
	listing: OpenListing;
	onClick: () => void;
	onBookmarkChange: (listingId: string, isBookmarked: boolean) => void;
};

export function ListingBrowseCard({ listing, onClick, onBookmarkChange }: ListingBrowseCardProps) {
	const t = useTranslations("ListingBrowseCard");
	const locale = useLocale();
	const remaining = getRemaining(listing.endDate, listing.status);
	const deadlineDateText = new Date(listing.endDate).toLocaleDateString(locale, {
		month: "numeric",
		day: "numeric",
	});
	const remainingText = remaining.isClosed
		? t("closed")
		: t("deadlineWithDays", { date: deadlineDateText, days: remaining.days });
	const registeredText = t("registeredOn", {
		date: new Date(listing.createdAt).toLocaleDateString(locale, {
			month: "numeric",
			day: "numeric",
		}),
	});
	const symbol = CURRENCY_SYMBOL[listing.currency];
	const itemNames = listing.items
		.map((item) => item.name)
		.filter(Boolean)
		.join(", ");
	const location = [listing.deliveryCity, listing.deliveryProvinsi].filter(Boolean).join(", ");

	return (
		<div
			onClick={onClick}
			className="flex cursor-pointer flex-col rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left transition-all hover:border-[#BFDBFE] hover:shadow-sm">
			<div className="mb-2 flex items-start justify-between gap-2">
				<span
					className={cn(
						"flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
						remaining.isClosed
							? "bg-[#F3F4F6] text-[#6B7280]"
							: remaining.isUrgent
								? "bg-[#FEF2F2] text-[#DC2626]"
								: "text-imsg-blue bg-[#EFF6FF]",
					)}>
					<Clock size={11} />
					{remainingText}
				</span>

				<div className="flex shrink-0 items-center gap-1">
					{listing.hasMyQuote && (
						<span className="flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-xs font-medium text-[#059669]">
							<CheckCircle2 size={11} />
							{t("quoteSent")}
						</span>
					)}
					<ListingBookmarkButton
						listingId={listing.id}
						initialBookmarked={listing.isBookmarked}
						onChange={(isBookmarked) => onBookmarkChange(listing.id, isBookmarked)}
					/>
				</div>
			</div>

			<p className="line-clamp-2 min-h-[42px] text-sm leading-snug font-medium text-[#1F2937]">
				{listing.title}
			</p>

			{itemNames && (
				<p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-[#6B7280]">
					<Package size={12} className="shrink-0" />
					<span className="truncate">{itemNames}</span>
				</p>
			)}

			<p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
				<CalendarDays size={12} className="shrink-0" />
				{registeredText}
			</p>

			<div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F3F4F6] pt-3">
				<div className="min-w-0">
					<p className="text-xs text-[#9CA3AF]">{t("budgetLabel")}</p>
					{listing.budgetPublic ? (
						<>
							<motion.p
								layoutId={`listing-budget-${listing.id}`}
								transition={{ type: "spring", stiffness: 300, damping: 30 }}
								className="mt-0.5 truncate text-sm font-medium text-[#1F2937]">
								{symbol} {listing.totalBudget.toLocaleString()}
							</motion.p>
							{listing.currency !== "KRW" && listing.budgetInKrw !== null && (
								<p className="truncate text-xs text-[#9CA3AF]">
									{t("aboutKrw", { value: Math.round(listing.budgetInKrw).toLocaleString() })}
								</p>
							)}
						</>
					) : (
						<motion.p
							layoutId={`listing-budget-${listing.id}`}
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
							className="mt-0.5 truncate text-sm font-medium text-[#1F2937]">
							{t("budgetPrivate")}
						</motion.p>
					)}
				</div>
				<div className="min-w-0">
					<p className="flex items-center gap-1 text-xs text-[#9CA3AF]">
						<MapPin size={11} />
						{t("deliveryLabel")}
					</p>
					<p className="mt-0.5 truncate text-sm font-medium text-[#1F2937]">{location || "-"}</p>
				</div>
			</div>

			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}
				disabled={remaining.isClosed}
				className="bg-imsg-blue mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]">
				{remaining.isClosed
					? t("closed")
					: listing.hasMyQuote
						? t("viewMyQuoteButton")
						: t("joinButton")}
			</button>
		</div>
	);
}
