import type {
	Currency,
	DeliveryMethod,
	ListingCategory,
	ListingStatus,
} from "@/features/buyer/types";

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
	office: "사무용품",
	lab: "연구장비",
	machinery: "산업기계",
	chemical: "화학약품",
	other: "기타 물품",
};

export const CATEGORY_OPTIONS: ListingCategory[] = ["office", "lab", "machinery", "chemical", "other"];

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
	sea_fob: "해상운송(FOB)",
	sea_cif: "해상운송(CIF)",
	air: "항공운송",
	negotiate: "협의 후 결정",
};

export const DELIVERY_METHOD_OPTIONS: DeliveryMethod[] = ["sea_fob", "sea_cif", "air", "negotiate"];
export const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
	active: "진행 중",
	closed: "마감",
	awarded: "계약 확정",
};
