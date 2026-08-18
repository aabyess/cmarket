import { createServerAdminClient } from "@/libs/supabaseServer";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";

export type InvoicePdfData = {
	invoiceNumber: string;
	issuedAt: string;
	paymentDueDate: string;
	listing: {
		title: string;
		items: { name: string; spec: string; quantity: number; unit: string }[];
	};
	quote: {
		price: number;
		currency: string;
		deliveryDays: number;
	};
	buyerCompany: {
		companyName: string;
		representative: string;
		address: string;
		npwp: string;
		businessNumber: string;
	};
	sellerCompany: {
		companyName: string;
		representative: string;
		address: string;
		businessType: string;
		businessItem: string;
		npwp: string;
		businessNumber: string;
	};
	bankAccount: {
		bankName: string;
		accountNumber: string;
		accountHolder: string;
		swiftCode: string;
		currency: string;
	} | null;
};

type InvoicePdfResult = InvoicePdfData & {
	buyerId: string;
	sellerId: string;
};

export type InvoiceMeta = {
	invoiceNumber: string;
	issuedAt: string;
	paymentDueDate: string;
};

export async function getInvoicePdfData(
	quoteId: string,
	locale: string,
	meta?: InvoiceMeta,
): Promise<InvoicePdfResult | null> {
	const admin = await createServerAdminClient();

	const { data: quote, error: quoteError } = await admin
		.from("quotes")
		.select("listing_id, seller_id, price, currency, delivery_days, created_at")
		.eq("id", quoteId)
		.single();

	if (quoteError || !quote) return null;

	const { data: listing, error: listingError } = await admin
		.from("listings")
		.select("user_id, title, title_source_lang, title_translations, items")
		.eq("id", quote.listing_id)
		.single();

	if (listingError || !listing) return null;

	const { data: buyerCompany } = await admin
		.from("companies")
		.select("company_name, representative, address, npwp, business_number")
		.eq("profile_id", listing.user_id)
		.single();

	const { data: sellerCompany } = await admin
		.from("companies")
		.select(
			"company_name, representative, address, npwp, business_number, business_type, business_type_source_lang, business_type_translations, business_item, business_item_source_lang, business_item_translations",
		)
		.eq("profile_id", quote.seller_id)
		.single();

	const { data: bankAccount } = await admin
		.from("bank_accounts")
		.select("bank_name, account_number, account_holder, swift_code, currency")
		.eq("profile_id", quote.seller_id)
		.eq("is_primary", true)
		.maybeSingle();

	const now = new Date();
	const resolvedMeta =
		meta ??
		(() => {
			const invoiceNumber = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${quoteId.slice(0, 6).toUpperCase()}`;
			const paymentDueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
			return { invoiceNumber, issuedAt: now.toISOString(), paymentDueDate };
		})();

	return {
		buyerId: listing.user_id,
		sellerId: quote.seller_id,
		...resolvedMeta,
		listing: {
			title: resolveTranslatedField(listing.title, listing.title_source_lang, listing.title_translations, locale),
			items: listing.items ?? [],
		},
		quote: {
			price: Number(quote.price),
			currency: quote.currency,
			deliveryDays: quote.delivery_days,
		},
		buyerCompany: {
			companyName: buyerCompany?.company_name ?? "",
			representative: buyerCompany?.representative ?? "",
			address: buyerCompany?.address ?? "",
			npwp: buyerCompany?.npwp ?? "",
			businessNumber: buyerCompany?.business_number ?? "",
		},
		sellerCompany: {
			companyName: sellerCompany?.company_name ?? "",
			representative: sellerCompany?.representative ?? "",
			address: sellerCompany?.address ?? "",
			npwp: sellerCompany?.npwp ?? "",
			businessNumber: sellerCompany?.business_number ?? "",
			businessType: resolveTranslatedField(
				sellerCompany?.business_type ?? "",
				sellerCompany?.business_type_source_lang ?? null,
				sellerCompany?.business_type_translations ?? null,
				locale,
			),
			businessItem: resolveTranslatedField(
				sellerCompany?.business_item ?? "",
				sellerCompany?.business_item_source_lang ?? null,
				sellerCompany?.business_item_translations ?? null,
				locale,
			),
		},
		bankAccount: bankAccount
			? {
				bankName: bankAccount.bank_name,
				accountNumber: bankAccount.account_number,
				accountHolder: bankAccount.account_holder,
				swiftCode: bankAccount.swift_code ?? "",
				currency: bankAccount.currency,
			}
			: null,
	};
}