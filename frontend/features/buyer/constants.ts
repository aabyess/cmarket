import type {
	Currency,
	DeliveryMethod,
	ListingCategory,
	ListingStatus,
} from "@/features/buyer/types";

type LabelTranslator = (key: string) => string;

export function getCategoryLabels(t: LabelTranslator): Record<ListingCategory, string> {
	return {
		office: t("office"),
		lab: t("lab"),
		machinery: t("machinery"),
		chemical: t("chemical"),
		other: t("other"),
	};
}

export const CATEGORY_OPTIONS: ListingCategory[] = ["office", "lab", "machinery", "chemical", "other"];

export function getDeliveryMethodLabels(t: LabelTranslator): Record<DeliveryMethod, string> {
	return {
		sea_fob: t("sea_fob"),
		sea_cif: t("sea_cif"),
		air: t("air"),
		negotiate: t("negotiate"),
	};
}

export const DELIVERY_METHOD_OPTIONS: DeliveryMethod[] = ["sea_fob", "sea_cif", "air", "negotiate"];
export const CURRENCY_SYMBOL: Record<Currency, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

export function getListingStatusLabels(t: LabelTranslator): Record<ListingStatus, string> {
	return {
		active: t("active"),
		closed: t("closed"),
		awarded: t("awarded"),
	};
}
