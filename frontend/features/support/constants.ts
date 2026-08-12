import type { FaqCategory, InquiryCategory, InquiryStatus } from "@/features/support/types";

export const INQUIRY_CATEGORY_LABELS: Record<InquiryCategory, string> = {
	ACCOUNT: "회원 · 계정",
	LISTING: "견적요청 등록",
	QUOTE: "견적 제출 · 비교",
	CONTRACT: "계약 · 납품",
	PAYMENT: "결제 · 정산",
	ETC: "기타",
};

export const INQUIRY_CATEGORY_OPTIONS: InquiryCategory[] = [
	"ACCOUNT",
	"LISTING",
	"QUOTE",
	"CONTRACT",
	"PAYMENT",
	"ETC",
];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
	OPEN: "답변 대기",
	ANSWERED: "답변 완료",
	CLOSED: "종료",
};

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
	ACCOUNT: "회원 · 계정",
	LISTING: "견적요청",
	QUOTE: "견적",
	CONTRACT: "계약 · 납품",
	PAYMENT: "결제 · 정산",
};

export const FAQ_CATEGORY_OPTIONS: FaqCategory[] = [
	"ACCOUNT",
	"LISTING",
	"QUOTE",
	"CONTRACT",
	"PAYMENT",
];

export const RESOURCE_BUCKET = "support-resources";
