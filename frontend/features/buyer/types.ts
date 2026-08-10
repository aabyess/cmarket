export type Currency = "USD" | "IDR" | "KRW";

export type ListingItem = {
	id: string;
	name: string;
	spec: string;
	quantity: number;
	unit: string;
	price: number;
};

export type ListingCategory = "office" | "lab" | "machinery" | "chemical";

export type ListingFormData = {
	title: string;
	category: ListingCategory;
	description: string;
	items: ListingItem[];
	currency: Currency;
	budgetPublic: boolean;
	totalBudget: number;
	endDate: string;
	deliveryDays: number;
	deliveryProvinsi: string;
	deliveryCity: string;
	deliveryAddress: string;
};

export type BuyerTodoHighlight = {
	label: string;
	value: string;
};

export type BuyerTodo = {
	id: string;
	listingId: string;
	title: string;
	description: string;
	deadlineText: string | null;
	actionLabel: string;
	highlights: BuyerTodoHighlight[];
};
export type BuyerSavings = {
	totalAmount: number;
	completedCount: number;
};

export type BuyerDashboardData = {
	listingCount: number;
	todos: BuyerTodo[];
	savings: BuyerSavings;
	badges: { quotes: number; chats: number };
	activities: BuyerActivity[];
};

export type BuyerActivityType = "quote" | "document" | "completed";

export type BuyerActivity = {
	id: string;
	type: BuyerActivityType;
	title: string;
	description: string;
	timeText: string;
};

// DB의 listings.status는 "active" | "closed"만 허용.
// "awarded"는 DB에 없고, closed 상태인 공고 중 awarded 상태의 quote가 있을 때
// 프론트에서 파생해서 표시하는 UI 전용 상태값.
export type ListingStatus = "active" | "closed" | "awarded";

export type ListingSummary = {
	id: string;
	title: string;
	items: ListingItem[];
	currency: Currency;
	totalBudget: number;
	budgetPublic: boolean;
	endDate: string;
	status: ListingStatus;
	createdAt: string;
	category: ListingCategory;
	quoteCount: number;
};

export type QuoteStatus = "pending" | "awarded" | "rejected";

export type SellerInfo = {
	profileId: string;
	companyName: string;
	representative: string;
	address: string;
	businessType: string;
	businessItem: string;
	logoUrl: string | null;
};

export type ReceivedQuote = {
	id: string;
	listingId: string;
	price: number;
	currency: Currency;
	priceInIdr: number | null;
	deliveryDays: number;
	note: string;
	status: QuoteStatus;
	createdAt: string;
	previousPrice: number | null;
	previousDeliveryDays: number | null;
	revisedAt: string | null;
	seller: SellerInfo;
};

export type ListingWithQuotes = {
	id: string;
	title: string;
	endDate: string;
	status: ListingStatus;
	currency: Currency;
	quoteCount: number;
	lowestPrice: number | null;
	fastestDays: number | null;
	createdAt: string;
};
