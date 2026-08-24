export type DisplayQuoteStatus = "pending" | "awarded" | "rejected" | "failed";

// 견적 status는 낙찰/거절 시에만 바뀌어서, 공고 마감일이 지나도 응답 없이 끝나면
// DB상 영원히 "pending"으로 남는다. 화면 표시에서만 "유찰"로 파생시킨다 —
// DB 값은 그대로 pending 유지.
export function getDisplayQuoteStatus(
	status: "pending" | "awarded" | "rejected",
	listingEndDate: string,
): DisplayQuoteStatus {
	if (status === "pending" && new Date(listingEndDate).getTime() < Date.now()) {
		return "failed";
	}
	return status;
}
