import type { ListingCategory } from "@/features/buyer/types";

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
	office: "사무용품",
	lab: "연구장비",
	machinery: "산업기계",
	chemical: "화학약품",
};

export const CATEGORY_OPTIONS: ListingCategory[] = ["office", "lab", "machinery", "chemical"];