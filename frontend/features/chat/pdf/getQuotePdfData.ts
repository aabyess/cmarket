import { createServerAdminClient } from "@/libs/supabaseServer";
import type { QuotePdfData } from "@/features/chat/pdf/QuotePdfDocument";

type QuotePdfResult = QuotePdfData & {
	listingId: string;
	buyerId: string;
	sellerId: string;
};

export async function getQuotePdfData(quoteId: string): Promise<QuotePdfResult | null> {
	const admin = await createServerAdminClient();

	const { data: quote, error: quoteError } = await admin
		.from("quotes")
		.select("listing_id, seller_id, price, currency, delivery_days, note, created_at")
		.eq("id", quoteId)
		.single();

	if (quoteError || !quote) return null;

	const { data: listing, error: listingError } = await admin
		.from("listings")
		.select(
			"user_id, title, category, items, currency, total_budget, budget_public, end_date, delivery_provinsi, delivery_city, delivery_address",
		)
		.eq("id", quote.listing_id)
		.single();

	if (listingError || !listing) return null;

	const { data: buyerCompany } = await admin
		.from("companies")
		.select("company_name, representative, address")
		.eq("profile_id", listing.user_id)
		.single();

	const { data: sellerCompany } = await admin
		.from("companies")
		.select("company_name, representative, address, business_type, business_item")
		.eq("profile_id", quote.seller_id)
		.single();

	return {
		listingId: quote.listing_id,
		buyerId: listing.user_id,
		sellerId: quote.seller_id,
		listing: {
			title: listing.title,
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
			note: quote.note ?? "",
			createdAt: quote.created_at,
		},
		buyerCompany: {
			companyName: buyerCompany?.company_name ?? "",
			representative: buyerCompany?.representative ?? "",
			address: buyerCompany?.address ?? "",
		},
		sellerCompany: {
			companyName: sellerCompany?.company_name ?? "",
			representative: sellerCompany?.representative ?? "",
			address: sellerCompany?.address ?? "",
			businessType: sellerCompany?.business_type ?? "",
			businessItem: sellerCompany?.business_item ?? "",
		},
	};
}