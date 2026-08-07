import { createClient } from "@/libs/supabase";
import type { BuyerProfileData } from "@/features/buyerProfile/types";

export async function getBuyerProfileData(): Promise<BuyerProfileData | null> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;

	const { data: company } = await supabase
		.from("companies")
		.select("company_name, representative, business_type, address")
		.eq("profile_id", user.id)
		.single();

	const { data: profile } = await supabase
		.from("company_profiles")
		.select("logo_url, description, established_year, employee_count, website_url, certifications")
		.eq("profile_id", user.id)
		.maybeSingle();

	return {
		company: {
			companyName: company?.company_name ?? "",
			representative: company?.representative ?? "",
			businessType: company?.business_type ?? "",
			address: company?.address ?? "",
		},
		profile: profile
			? {
					logoUrl: profile.logo_url,
					description: profile.description,
					establishedYear: profile.established_year,
					employeeCount: profile.employee_count,
					websiteUrl: profile.website_url,
					certifications: profile.certifications ?? [],
				}
			: null,
	};
}