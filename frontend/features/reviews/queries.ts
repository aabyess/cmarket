"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyReviews } from "@/features/reviews/apis";

export const REVIEWS_QUERY_KEYS = {
	myReviews: (contractIds: string[]) => ["reviews", "my", [...contractIds].sort()] as const,
};

export function useMyReviews(contractIds: string[]) {
	return useQuery({
		queryKey: REVIEWS_QUERY_KEYS.myReviews(contractIds),
		queryFn: () => getMyReviews(contractIds),
		enabled: contractIds.length > 0,
	});
}
