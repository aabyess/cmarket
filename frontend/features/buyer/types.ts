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