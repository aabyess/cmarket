export type ListingType = "물품" | "공사" | "용역" | "매각";

export type ListingItem = {
	id: string;
	name: string;
	spec: string;
	quantity: number;
	unit: string;
	price: number;
};

export type ListingFormData = {
	type: ListingType;
	title: string;
	description: string;
	items: ListingItem[];
	budgetPublic: boolean;
	totalBudget: number;
	startDate: string;
	endDate: string;
	winnerSelection: string;
	deliveryDays: number;
	contactName: string;
	contactPhone: string;
	contactEmail: string;
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