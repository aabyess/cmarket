export type MyReview = {
	contractId: string;
	rating: number;
	comment: string;
};

export type SubmitReviewInput = {
	contractId: string;
	rating: number;
	comment?: string;
};
