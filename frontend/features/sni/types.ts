import type { ListingCategory } from "@/features/buyer/types";

export type SniRequiredLevel = "yes" | "conditional" | "unknown";

export type SniChecklistEntry = {
	category: ListingCategory;
	sniRequired: SniRequiredLevel;
	/** 표시 텍스트(품목명·비고)는 messages 쪽 representativeItems 배열과 인덱스로 짝지어진다. */
	itemSniRequired: boolean[];
	sourceUrl: string;
	lastCheckedDate: string;
};
