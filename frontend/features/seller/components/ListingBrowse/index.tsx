"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search, FileSearch } from "lucide-react";
import { cn } from "@/utils/cn";
import { ListingBrowseCard } from "@/features/seller/components/ListingBrowse/ListingBrowseCard";
import type { OpenListing } from "@/features/seller/types";

type StatusTab = "all" | "active" | "closed";

const TAB_VALUES: StatusTab[] = ["all", "active", "closed"];

type ListingBrowseProps = {
	listings: OpenListing[];
};

export function ListingBrowse({ listings }: ListingBrowseProps): React.ReactNode {
	const t = useTranslations("ListingBrowse");
	const router = useRouter();
	const [keyword, setKeyword] = useState("");
	const [statusTab, setStatusTab] = useState<StatusTab>("all");

	const tabLabels: Record<StatusTab, string> = {
		all: t("tabAll"),
		active: t("tabActive"),
		closed: t("tabClosed"),
	};

	const trimmedKeyword = keyword.trim().toLowerCase();

	const filteredListings = useMemo(() => {
		return listings.filter((listing) => {
			const isClosed =
				listing.status !== "active" || new Date(listing.endDate).getTime() <= Date.now();
			if (statusTab === "active" && isClosed) return false;
			if (statusTab === "closed" && !isClosed) return false;
			if (!trimmedKeyword) return true;

			const haystack = [
				listing.title,
				listing.description,
				...listing.items.map((item) => item.name),
				...listing.items.map((item) => item.spec),
			]
				.join(" ")
				.toLowerCase();
			return haystack.includes(trimmedKeyword);
		});
	}, [listings, statusTab, trimmedKeyword]);

	return (
		<div>
			<div className="relative mb-3">
				<Search
					size={18}
					className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
				/>
				<input
					type="text"
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder={t("searchPlaceholder")}
					className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3.5 pl-11 pr-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-imsg-blue focus:outline-none focus:ring-1 focus:ring-imsg-blue"
				/>
			</div>

			<div className="mb-4 flex w-fit gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				{TAB_VALUES.map((value) => (
					<button
						key={value}
						onClick={() => setStatusTab(value)}
						className={cn(
							"rounded-lg px-4 py-1.5 text-xs font-medium transition-colors",
							statusTab === value
								? "bg-imsg-blue text-white"
								: "text-[#6B7280] hover:bg-[#F9FAFB]",
						)}
					>
						{tabLabels[value]}
					</button>
				))}
			</div>

			{filteredListings.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
						<FileSearch size={26} className="text-[#9CA3AF]" />
					</div>
					<p className="text-base font-medium text-[#1F2937]">
						{trimmedKeyword ? t("emptySearchTitle") : t("emptyDefaultTitle")}
					</p>
					<p className="mt-1 text-sm text-[#6B7280]">
						{trimmedKeyword
							? t("emptySearchDescription")
							: t("emptyDefaultDescription")}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{filteredListings.map((listing) => (
						<ListingBrowseCard
							key={listing.id}
							listing={listing}
							onClick={() => router.push(`/seller/listing-browse/${listing.id}`)}
						/>
					))}
				</div>
			)}
		</div>
	);
}