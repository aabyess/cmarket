import { createServerAdminClient } from "@/libs/supabaseServer";
import { resolveTranslatedField } from "@/utils/resolveTranslatedField";
import { translateTextServer, type SupportedLocale } from "@/libs/translateFieldServer";
import type { QuotePdfData } from "@/features/chat/pdf/QuotePdfDocument";

type QuotePdfResult = QuotePdfData & {
	listingId: string;
	buyerId: string;
	sellerId: string;
};

type ListingItem = { id: string; name: string; spec: string; quantity: number; unit: string };
type PdfItem = ListingItem & { unitPrice: number };

function toSupportedLocale(locale: string): SupportedLocale {
	return locale === "ko" || locale === "id" ? locale : "en";
}

/** 바이어가 원어로 입력한 품목명·사양을 지정한 언어로 번역한다. DB에는 저장하지 않고 이 PDF에만 반영된다. */
async function translateItemsList(items: ListingItem[], locale: string): Promise<ListingItem[]> {
	const targetLocale = toSupportedLocale(locale);
	return Promise.all(
		items.map(async (item) => {
			const [name, spec] = await Promise.all([
				translateTextServer(item.name, targetLocale),
				translateTextServer(item.spec, targetLocale),
			]);
			return { ...item, name, spec };
		}),
	);
}

export async function getQuotePdfData(
	quoteId: string,
	locale: string,
	translateItems = false,
): Promise<QuotePdfResult | null> {
	const admin = await createServerAdminClient();

	const { data: quote, error: quoteError } = await admin
		.from("quotes")
		.select(
			"listing_id, seller_id, price, currency, delivery_days, note, note_source_lang, note_translations, created_at, items, attachments, payment_terms",
		)
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

	const rawItems: ListingItem[] = listing.items ?? [];
	const translatedItems = translateItems ? await translateItemsList(rawItems, locale) : rawItems;

	const quoteItemPrices = (quote.items ?? []) as { itemId: string; unitPrice: number }[];
	const unitPriceByItemId = new Map(quoteItemPrices.map((entry) => [entry.itemId, entry.unitPrice]));
	const items: PdfItem[] = translatedItems.map((item) => ({
		...item,
		unitPrice: unitPriceByItemId.get(item.id) ?? 0,
	}));

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
			items,
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
			paymentTerms: quote.payment_terms,
			attachments: ((quote.attachments ?? []) as { fileName: string }[]).map((a) => ({ fileName: a.fileName })),
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