import { createServerAdminClient } from "@/libs/supabaseServer";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";

export type ReceiptCompanyInfo = {
	companyName: string;
	representative: string;
	address: string;
};

export type ReceiptPdfResult = {
	buyerId: string;
	sellerId: string;
	// 아직 결제 확인 전인 계약도 조회는 될 수 있어 null을 허용한다.
	// "결제 완료된 거래만 발급 가능" 판단은 라우트에서 한다.
	paymentConfirmedAt: string | null;
	contractNumber: string;
	listingTitle: string;
	price: number;
	currency: string;
	buyerCompany: ReceiptCompanyInfo;
	sellerCompany: ReceiptCompanyInfo & { bankName: string };
};

function formatContractNumber(contractId: string): string {
	return contractId.slice(0, 8).toUpperCase();
}

export async function getReceiptPdfData(contractId: string, locale: string): Promise<ReceiptPdfResult | null> {
	const admin = await createServerAdminClient();

	const { data: contract, error } = await admin
		.from("contracts")
		.select("id, buyer_id, seller_id, quote_id, listing_id, payment_confirmed_at")
		.eq("id", contractId)
		.single();

	if (error || !contract) return null;

	const [{ data: listing }, { data: quote }, { data: buyerCompany }, { data: sellerCompany }, { data: bankAccount }] =
		await Promise.all([
			admin
				.from("listings")
				.select("title, title_source_lang, title_translations")
				.eq("id", contract.listing_id)
				.single(),
			admin.from("quotes").select("price, currency").eq("id", contract.quote_id).single(),
			admin
				.from("companies")
				.select("company_name, representative, address")
				.eq("profile_id", contract.buyer_id)
				.single(),
			admin
				.from("companies")
				.select("company_name, representative, address")
				.eq("profile_id", contract.seller_id)
				.single(),
			admin
				.from("bank_accounts")
				.select("bank_name")
				.eq("profile_id", contract.seller_id)
				.eq("is_primary", true)
				.maybeSingle(),
		]);

	return {
		buyerId: contract.buyer_id,
		sellerId: contract.seller_id,
		paymentConfirmedAt: contract.payment_confirmed_at,
		contractNumber: formatContractNumber(contract.id),
		listingTitle: resolveTranslatedField(
			listing?.title ?? "",
			listing?.title_source_lang ?? null,
			listing?.title_translations ?? null,
			locale,
		),
		price: Number(quote?.price ?? 0),
		currency: quote?.currency ?? "KRW",
		buyerCompany: {
			companyName: buyerCompany?.company_name ?? "",
			representative: buyerCompany?.representative ?? "",
			address: buyerCompany?.address ?? "",
		},
		sellerCompany: {
			companyName: sellerCompany?.company_name ?? "",
			representative: sellerCompany?.representative ?? "",
			address: sellerCompany?.address ?? "",
			bankName: bankAccount?.bank_name ?? "",
		},
	};
}
