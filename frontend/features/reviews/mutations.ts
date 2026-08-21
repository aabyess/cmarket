"use client";

import type { SubmitReviewInput } from "@/features/reviews/types";

export async function submitReview(input: SubmitReviewInput): Promise<void> {
	const res = await fetch("/api/reviews", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	});

	if (!res.ok) {
		const { error } = await res.json();
		throw new Error(error ?? "평가 등록에 실패했습니다.");
	}
}
