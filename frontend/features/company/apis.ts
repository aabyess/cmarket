import { createServerAdminClient } from "@/libs/supabaseServer";

export type PublicCompanyProfile = {
	profileId: string;
	companyName: string;
	representative: string;
	businessType: string;
	businessItem: string;
	address: string;
	logoUrl: string | null;
	description: string | null;
	establishedYear: number | null;
	employeeCount: string | null;
	certifications: string[];
	websiteUrl: string | null;
	products: {
		id: string;
		name: string;
		description: string | null;
		imageUrls: string[];
		priceRange: string | null;
	}[];
};

export async function getPublicCompanyProfile(profileId: string): Promise<PublicCompanyProfile | null> {
	const admin = await createServerAdminClient();

	const { data: company } = await admin
		.from("companies")
		.select("profile_id, company_name, representative, business_type, business_item, address")
		.eq("profile_id", profileId)
		.single();

	if (!company) return null;

	const { data: profile } = await admin
		.from("company_profiles")
		.select("logo_url, description, established_year, employee_count, certifications, website_url")
		.eq("profile_id", profileId)
		.single();

	const { data: products } = await admin
		.from("products")
		.select("id, name, description, image_urls, price_range")
		.eq("profile_id", profileId)
		.order("sort_order", { ascending: true });

	return {
		profileId: company.profile_id,
		companyName: company.company_name ?? "",
		representative: company.representative ?? "",
		businessType: company.business_type ?? "",
		businessItem: company.business_item ?? "",
		address: company.address ?? "",
		logoUrl: profile?.logo_url ?? null,
		description: profile?.description ?? null,
		establishedYear: profile?.established_year ?? null,
		employeeCount: profile?.employee_count ?? null,
		certifications: profile?.certifications ?? [],
		websiteUrl: profile?.website_url ?? null,
		products: (products ?? []).map((p) => ({
			id: p.id,
			name: p.name,
			description: p.description,
			imageUrls: p.image_urls ?? [],
			priceRange: p.price_range,
		})),
	};
}