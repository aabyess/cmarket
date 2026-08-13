import type {
	Currency,
	DeliveryMethod,
	DeliveryTimingMode,
	ListingAttachment,
	ListingCategory,
	ListingItem,
} from "@/features/buyer/types";

export type SellerDashboardData = {
	openListingCount: number;
	quoteCount: number;
	pendingQuoteCount: number;
	awardedQuoteCount: number;
	contractCount: number;
	activities: { title: string; timeText: string }[];
};

export type OpenListing = {
	id: string;
	title: string;
	description: string;
	items: ListingItem[];
	currency: Currency;
	totalBudget: number;
	budgetInKrw: number | null;
	budgetPublic: boolean;
	endDate: string;
	deliveryProvinsi: string;
	deliveryCity: string;
	createdAt: string;
	hasMyQuote: boolean;
	status: "active" | "closed" | "awarded";
};
export type ListingDetail = OpenListing & {
	category: ListingCategory;
	deliveryAddress: string;
	deliveryAddressDetail: string;
	deliveryDays: number;
	deliveryMethod: DeliveryMethod;
	deliveryTimingMode: DeliveryTimingMode;
	deliveryDeadlineDate: string | null;
	deliveryLat: number | null;
	deliveryLng: number | null;
	attachments: ListingAttachment[];
	companyName: string;
	// 담당자 연락처는 계약 성립 전까지 공급기업에 제공하지 않는다(제3자 제공 동의 범위).
	myQuote: MyQuoteSummary | null;
};

export type QuoteFormData = {
	price: number;
	currency: Currency;
	deliveryDays: number;
	note: string;
};

export type QuoteStatus = "pending" | "awarded" | "rejected";

export type MyQuote = {
	id: string;
	listingId: string;
	listingTitle: string;
	buyerCompanyName: string;
	price: number;
	currency: Currency;
	deliveryDays: number;
	note: string;
	status: QuoteStatus;
	createdAt: string;
	listingEndDate: string;
};

export type MyQuoteSummary = {
	id: string;
	price: number;
	currency: Currency;
	deliveryDays: number;
	note: string;
	status: "pending" | "awarded" | "rejected";
};