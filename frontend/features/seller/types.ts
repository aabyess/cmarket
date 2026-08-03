import type { Currency, ListingItem } from "@/features/buyer/types";

export type SellerDashboardData = {
	openListingCount: number;
	quoteCount: number;
};

export type OpenListing = {
	id: string;
	title: string;
	description: string;
	items: ListingItem[];
	currency: Currency;
	totalBudget: number;
	budgetPublic: boolean;
	endDate: string;
	deliveryProvinsi: string;
	deliveryCity: string;
	createdAt: string;
	hasMyQuote: boolean;
};
export type ListingDetail = OpenListing & {
	deliveryAddress: string;
	deliveryDays: number;
	companyName: string;
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