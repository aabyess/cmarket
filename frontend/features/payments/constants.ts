import type { Contract } from "@/features/contract/types";
import type { PaymentFilter, PaymentMethod, PaymentStatus } from "@/features/payments/types";

export const PAYMENT_FILTER_VALUES: PaymentFilter[] = [
	"all",
	"awaitingReceipt",
	"awaitingConfirmation",
	"confirmed",
];

/** 지금은 송금뿐이라 모든 계약이 이 값을 쓴다. PG(카드결제) 연동 시 계약별로 실제 값이 갈릴 자리. */
export const PAYMENT_METHOD: PaymentMethod = "wire";

/** 결제창의 "상태"는 계약 진행 상태(ContractStatus)가 아니라 결제 단계만 본다. */
export function getPaymentStatus(contract: Contract): PaymentStatus {
	if (contract.paymentConfirmedAt) return "confirmed";
	if (contract.paymentReceiptUrl) return "awaitingConfirmation";
	return "awaitingReceipt";
}
