export type PaymentStatus = "awaitingReceipt" | "awaitingConfirmation" | "confirmed";

export type PaymentFilter = "all" | PaymentStatus;

/** 결제 수단. 지금은 송금뿐이지만 카드결제(PG) 추가를 대비해 데이터처럼 다룬다. */
export type PaymentMethod = "wire";
