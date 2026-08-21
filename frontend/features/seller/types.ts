import type {
	Currency,
	DeliveryMethod,
	DeliveryTimingMode,
	ListingAttachment,
	ListingCategory,
	ListingItem,
	QuoteItemPrice,
} from "@/features/buyer/types";

export type SellerDashboardData = {
	openListingCount: number;
	quoteCount: number;
	pendingQuoteCount: number;
	awardedQuoteCount: number;
	contractCount: number;
	activities: { title: string; timeText: string }[];
};

export type SellerTodoKind = "quotePending" | "awarded" | "deliveryDue" | "paymentConfirm";

export type SellerTodo = {
	id: string;
	kind: SellerTodoKind;
	listingId: string | null;
	contractId: string | null;
	title: string;
	description: string;
	deadlineText: string | null;
	actionLabel: string;
	highlights: { label: string; value: string }[];
};

// 목록(탐색) 화면은 카드/검색에 쓰는 name/spec만 있으면 되고, quantity/unit/price는
// 어디서도 쓰지 않는다 — 전체 필드를 내려보내면 공고가 많을 때 페이로드가 불필요하게 커진다.
export type ListingBrowseItem = Pick<ListingItem, "name" | "spec">;

export type OpenListing = {
	id: string;
	title: string;
	description: string;
	items: ListingBrowseItem[];
	currency: Currency;
	totalBudget: number;
	budgetInKrw: number | null;
	budgetPublic: boolean;
	endDate: string;
	deliveryProvinsi: string;
	deliveryCity: string;
	createdAt: string;
	hasMyQuote: boolean;
	isBookmarked: boolean;
	status: "active" | "closed" | "awarded";
};
export type ListingDetail = Omit<OpenListing, "items"> & {
	items: ListingItem[];
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
	items: QuoteItemPrice[];
	attachments: ListingAttachment[];
	paymentTerms: string;
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
	items: QuoteItemPrice[];
	attachments: ListingAttachment[];
	paymentTerms: string | null;
};
