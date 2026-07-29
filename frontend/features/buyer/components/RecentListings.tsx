"use client";

import { ArrowRight } from "lucide-react";

type ListingStatus = "active" | "pending" | "closed";

type Listing = {
	id: string;
	name: string;
	category: string;
	bids: number;
	deadline: string;
	status: ListingStatus;
};

const mockListings: Listing[] = [
	{ id: "LT001", name: "Office Supply Bundle - 500 units", category: "Office Supplies", bids: 8, deadline: "2026-08-05", status: "active" },
	{ id: "LT002", name: "Laboratory Equipment - 진동 측정기", category: "Lab Equipment", bids: 12, deadline: "2026-07-30", status: "pending" },
	{ id: "LT003", name: "Industrial Chemicals - 케미컬 용제", category: "Chemicals", bids: 5, deadline: "2026-07-28", status: "closed" },
	{ id: "LT004", name: "Industrial Machinery Parts", category: "Industrial Goods", bids: 15, deadline: "2026-08-10", status: "active" },
	{ id: "LT005", name: "Bulk Stationery Order - 1000 packs", category: "Office Supplies", bids: 3, deadline: "2026-08-02", status: "active" },
];

const statusBadgeMap: Record<ListingStatus, { label: string; color: string }> = {
	active: { label: "진행중", color: "bg-sky-100/80 text-sky-700 border border-sky-200" },
	pending: { label: "낙찰대기", color: "bg-amber-100/80 text-amber-700 border border-amber-200" },
	closed: { label: "마감", color: "bg-gray-100/70 text-gray-600 border border-gray-200" },
};

export function RecentListings() {
	return (
		<div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
			<div className="p-7 border-b border-border">
				<h2 className="text-lg font-bold text-card-foreground">최근 공고</h2>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-sm whitespace-nowrap">
					<thead className="bg-muted/60 border-b border-border">
						<tr>
							{["공고 ID", "명칭", "카테고리", "입찰", "마감일", "상태", "액션"].map((th) => (
								<th
									key={th}
									className="px-3 py-4 text-left font-semibold text-card-foreground text-xs uppercase tracking-wide">
									{th}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-border/40">
						{mockListings.map((listing) => {
							const badge = statusBadgeMap[listing.status];
							return (
								<tr
									key={listing.id}
									className="hover:bg-indigo-50/40 transition-all duration-200 cursor-pointer group">
									<td className="px-3 py-5 font-mono text-xs text-muted-foreground/70">{listing.id}</td>
									<td className="px-3 py-5 max-w-xs">
										<p className="font-medium text-card-foreground group-hover:text-indigo-700 transition-colors truncate">
											{listing.name}
										</p>
									</td>
									<td className="px-3 py-5 text-muted-foreground text-sm">{listing.category}</td>
									<td className="px-3 py-5 text-center">
										<span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-500/15 text-indigo-700 rounded-full font-semibold text-sm border border-indigo-200/50">
											{listing.bids}
										</span>
									</td>
									<td className="px-3 py-5 text-muted-foreground text-sm">
										{new Date(listing.deadline).toLocaleDateString("ko-KR")}
									</td>
									<td className="px-3 py-5 text-center">
										<span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold w-20 text-center ${badge.color}`}>
											{badge.label}
										</span>
									</td>
									<td className="px-3 py-5 text-center">
										<button className="p-2 hover:bg-indigo-500/15 rounded-lg transition-all duration-200 inline-flex items-center justify-center">
											<ArrowRight size={18} className="text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<div className="px-7 py-5 border-t border-border bg-muted/30 flex items-center justify-between">
				<p className="text-sm font-medium text-muted-foreground">총 {mockListings.length}개의 공고</p>
				<a href="#" className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors text-sm">
					모든 공고 보기 <ArrowRight size={16} />
				</a>
			</div>
		</div>
	);
}