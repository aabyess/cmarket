import type { MyReview } from "@/features/reviews/types";

export async function getMyReviews(contractIds: string[]): Promise<MyReview[]> {
	if (contractIds.length === 0) return [];

	const res = await fetch(`/api/reviews?contractIds=${encodeURIComponent(contractIds.join(","))}`);
	if (!res.ok) return [];

	return res.json();
}
