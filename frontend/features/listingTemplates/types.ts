import type { ListingCategory, ListingItem } from "@/features/buyer/types";

export type ListingTemplate = {
	id: string;
	name: string;
	title: string;
	category: ListingCategory | null;
	description: string;
	items: ListingItem[];
	currency: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ListingTemplateInput = {
	name: string;
	title: string;
	category: ListingCategory | null;
	description: string;
	items: ListingItem[];
	currency: string | null;
};
