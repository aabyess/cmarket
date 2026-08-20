export type QuoteTemplate = {
	id: string;
	name: string;
	note: string;
	paymentTerms: string;
	deliveryDays: number | null;
	currency: string | null;
	createdAt: string;
	// 관리 페이지 목록에 수정일을 보여주기 위한 필드. 계약에 명시된 필드는 아니지만
	// 값을 추가하는 것뿐이라 담당2가 쓸 필드에는 영향이 없다.
	updatedAt: string;
};

export type QuoteTemplateInput = {
	name: string;
	note: string;
	paymentTerms: string;
	deliveryDays: number | null;
	currency: string | null;
};
