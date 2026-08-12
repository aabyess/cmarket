export type ContractStatus = "ongoing" | "completed" | "cancelled";

export type Contract = {
	id: string;
	listingId: string;
	quoteId: string;
	buyerId: string;
	sellerId: string;
	status: ContractStatus;
	createdAt: string;
	listing: {
		title: string;
	};
	quote: {
		price: number;
		currency: string;
		deliveryDays: number;
	};
	partnerCompanyName: string;
	paymentReceiptUrl: string | null;
	paymentConfirmedAt: string | null;
};
/** 계약 목록 탭. 취소된 계약은 전체에서만 보인다. */
export type ContractFilter = "all" | "ongoing" | "completed";
