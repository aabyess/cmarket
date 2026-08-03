export type Currency = "USD" | "IDR" | "KRW";

export type ListingItem = {
	id: string;
	name: string;
	spec: string;
	quantity: number;
	unit: string;
	price: number;
};

export type ListingFormData = {
	title: string;
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
	quoteCount: number;
};