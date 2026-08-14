import type { FaqCategory, InquiryCategory, InquiryStatus } from "@/features/support/types";

type LabelTranslator = (key: string) => string;

export function getInquiryCategoryLabels(t: LabelTranslator): Record<InquiryCategory, string> {
	return {
		ACCOUNT: t("ACCOUNT"),
		LISTING: t("LISTING"),
		QUOTE: t("QUOTE"),
		CONTRACT: t("CONTRACT"),
		PAYMENT: t("PAYMENT"),
		ETC: t("ETC"),
	};
}

export const INQUIRY_CATEGORY_OPTIONS: InquiryCategory[] = [
	"ACCOUNT",
	"LISTING",
	"QUOTE",
	"CONTRACT",
	"PAYMENT",
	"ETC",
];

export function getInquiryStatusLabels(t: LabelTranslator): Record<InquiryStatus, string> {
	return {
		OPEN: t("OPEN"),
		ANSWERED: t("ANSWERED"),
		CLOSED: t("CLOSED"),
	};
}

export function getFaqCategoryLabels(t: LabelTranslator): Record<FaqCategory, string> {
	return {
		ACCOUNT: t("ACCOUNT"),
		LISTING: t("LISTING"),
		QUOTE: t("QUOTE"),
		CONTRACT: t("CONTRACT"),
		PAYMENT: t("PAYMENT"),
	};
}

export const FAQ_CATEGORY_OPTIONS: FaqCategory[] = [
	"ACCOUNT",
	"LISTING",
	"QUOTE",
	"CONTRACT",
	"PAYMENT",
];

export const RESOURCE_BUCKET = "support-resources";
