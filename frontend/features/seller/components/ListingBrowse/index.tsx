"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileSearch } from "lucide-react";
import { cn } from "@/utils/cn";
import { ListingBrowseCard } from "@/features/seller/components/ListingBrowse/ListingBrowseCard";
import type { OpenListing } from "@/features/seller/types";

type StatusTab = "all" | "active" | "closed";

const TABS: { value: StatusTab; label: string }[] = [
	{ value: "all", label: "전체" },
	{ value: "active", label: "진행중" },
	{ value: "closed", label: "마감" },
];

type ListingBrowseProps = {
	listings: OpenListing[];
};

export function ListingBrowse({ listings }: ListingBrowseProps): React.ReactNode {
	const router = useRouter();
	const [keyword, setKeyword] = useState("");
	const [statusTab, setStatusTab] = useState<StatusTab>("all");

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
					placeholder="품목명, 공고 제목으로 검색"
					className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3.5 pl-11 pr-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
				/>
			</div>

			<div className="mb-4 flex w-fit gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				{TABS.map((tab) => (
					<button
						key={tab.value}
						onClick={() => setStatusTab(tab.value)}
						className={cn(
							"rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors",
							statusTab === tab.value
								? "bg-[#3B82F6] text-white"
								: "text-[#6B7280] hover:bg-[#F9FAFB]",
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{filteredListings.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
						<FileSearch size={26} className="text-[#9CA3AF]" />
					</div>
					<p className="text-[17px] font-medium text-[#1F2937]">
						{trimmedKeyword ? "검색 결과가 없어요" : "해당하는 공고가 없어요"}
					</p>
					<p className="mt-1 text-sm text-[#6B7280]">
						{trimmedKeyword
							? "다른 키워드로 검색해보세요."
							: "새 공고가 올라오면 알려드릴게요."}
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