"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileSearch } from "lucide-react";
import { ListingBrowseCard } from "@/features/seller/components/ListingBrowse/ListingBrowseCard";
import type { OpenListing } from "@/features/seller/types";

type ListingBrowseProps = {
	listings: OpenListing[];
};

export function ListingBrowse({ listings }: ListingBrowseProps) {
	const router = useRouter();
	const [keyword, setKeyword] = useState("");

	const trimmedKeyword = keyword.trim().toLowerCase();
	const filteredListings = trimmedKeyword
		? listings.filter((listing) => {
				const haystack = [
					listing.title,
					listing.description,
					...listing.items.map((item) => item.name),
					...listing.items.map((item) => item.spec),
				]
					.join(" ")
					.toLowerCase();
				return haystack.includes(trimmedKeyword);
			})
		: listings;

	return (
		<div>
			<div className="relative mb-4">
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

			{filteredListings.length === 0 ? (
				<div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#F3F4F6]">
						<FileSearch size={26} className="text-[#9CA3AF]" />
					</div>
					<p className="text-[17px] font-medium text-[#1F2937]">
						{trimmedKeyword ? "검색 결과가 없어요" : "열려 있는 공고가 없어요"}
					</p>
					<p className="mt-1 text-sm text-[#6B7280]">
						{trimmedKeyword
							? "다른 키워드로 검색해보세요."
							: "새 공고가 올라오면 알려드릴게요."}
					</p>
				</div>
			) : (
				<div className="space-y-3">
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