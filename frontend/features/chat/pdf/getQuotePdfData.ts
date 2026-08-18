import { createServerAdminClient } from "@/libs/supabaseServer";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import type { QuotePdfData } from "@/features/chat/pdf/QuotePdfDocument";

type QuotePdfResult = QuotePdfData & {
	listingId: string;
	buyerId: string;
	sellerId: string;
};

export async function getQuotePdfData(quoteId: string, locale: string): Promise<QuotePdfResult | null> {
	const admin = await createServerAdminClient();

	const { data: quote, error: quoteError } = await admin
		.from("quotes")
		.select("listing_id, seller_id, price, currency, delivery_days, note, note_source_lang, note_translations, created_at")
		.eq("id", quoteId)
		.single();

	if (quoteError || !quote) return null;

	const { data: listing, error: listingError } = await admin
		.from("listings")
		.select(
			"user_id, title, title_source_lang, title_translations, category, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, delivery_address",
		)
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

	return {
		listingId: quote.listing_id,
		buyerId: listing.user_id,
		sellerId: quote.seller_id,
		listing: {
			title: resolveTranslatedField(listing.title, listing.title_source_lang, listing.title_translations, locale),
			category: listing.category,
			items: listing.items ?? [],
			currency: listing.currency,
			totalBudget: Number(listing.total_budget ?? 0),
			budgetPublic: listing.budget_public ?? false,
			endDate: listing.end_date,
			deliveryProvinsi: listing.delivery_provinsi ?? "",
			deliveryCity: listing.delivery_city ?? "",
			deliveryAddress: listing.delivery_address ?? "",
		},
		quote: {
			price: Number(quote.price),
			currency: quote.currency,
			deliveryDays: quote.delivery_days,
			note: resolveTranslatedField(quote.note ?? "", quote.note_source_lang, quote.note_translations, locale),
			createdAt: quote.created_at,
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
	};
}