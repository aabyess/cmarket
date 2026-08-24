import type { ListingStatus } from "@/features/buyer/types";

export type DisplayListingStatus = ListingStatus | "failed";

// listings.status는 낙찰(award_quote RPC) 시에만 바뀌어서, 마감일이 지나도 낙찰 없이
// 끝난 공고는 DB상 영원히 "active"로 남는다. 화면 표시에서만 "유찰"로 파생시킨다 —
// DB 값이나 마이그레이션은 건드리지 않는다.
export function getDisplayListingStatus(
	status: ListingStatus,
	endDate: string,
	hasAwardedQuote: boolean,
): DisplayListingStatus {
	if (status === "active" && !hasAwardedQuote && new Date(endDate).getTime() < Date.now()) {
		return "failed";
	}
	return status;
}
