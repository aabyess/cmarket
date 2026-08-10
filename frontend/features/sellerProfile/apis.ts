import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { SellerProfileData } from "@/features/sellerProfile/types";

export async function getSellerProfileData(): Promise<SellerProfileData | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;

	const { data: company } = await supabase
		.from("companies")
		.select("company_name, business_type, business_item, representative, address, business_number")
		.eq("profile_id", user.id)
		.single();

	const { data: profile } = await supabase
		.from("company_profiles")
		.select("*")
		.eq("profile_id", user.id)
		.single();

	const { data: products } = await supabase
		.from("products")
		.select("*")
		.eq("profile_id", user.id)
		.order("sort_order", { ascending: true });

	const { data: bankAccount } = await supabase
		.from("bank_accounts")
		.select("id, bank_name, account_number, account_holder, swift_code, currency")
		.eq("profile_id", user.id)
		.eq("is_primary", true)
		.maybeSingle();

	return {
		company: {
			companyName: company?.company_name ?? "",
			businessType: company?.business_type ?? "",
			businessItem: company?.business_item ?? "",
			representative: company?.representative ?? "",
			address: company?.address ?? "",
			businessNumber: company?.business_number ?? "",
		},
		profile: profile
			? {
				id: profile.id,
				profileId: profile.profile_id,
				logoUrl: profile.logo_url,
				description: profile.description,
				establishedYear: profile.established_year,
				employeeCount: profile.employee_count,
				certifications: profile.certifications ?? [],
				websiteUrl: profile.website_url,
				categories: profile.categories ?? [],
			}
			: null,
		products: (products ?? []).map((p) => ({
			id: p.id,
			profileId: p.profile_id,
			name: p.name,
			description: p.description,
			imageUrls: p.image_urls ?? [],
			catalogUrl: p.catalog_url,
			priceRange: p.price_range,
			sortOrder: p.sort_order,
		})),
		bankAccount: bankAccount
			? {
				id: bankAccount.id,
				bankName: bankAccount.bank_name,
				accountNumber: bankAccount.account_number,
				accountHolder: bankAccount.account_holder,
				swiftCode: bankAccount.swift_code ?? "",
				currency: bankAccount.currency,
			}
			: null,
	};
}