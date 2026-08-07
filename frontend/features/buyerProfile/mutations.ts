import { createClient } from "@/libs/supabase";

type UpdateBuyerProfileInput = {
	logoUrl: string;
	description: string;
	establishedYear: number | null;
	employeeCount: string;
	websiteUrl: string;
	certifications: string[];
};

export async function updateBuyerProfile(data: UpdateBuyerProfileInput): Promise<void> {
	const supabase = createClient();
	const { data: { user }, error: userError } = await supabase.auth.getUser();
	if (userError || !user) throw new Error("로그인이 필요합니다.");

	const { error } = await supabase.from("company_profiles").upsert(
		{
			profile_id: user.id,
			logo_url: data.logoUrl,
			description: data.description,
			established_year: data.establishedYear,
			employee_count: data.employeeCount,
			website_url: data.websiteUrl,
			certifications: data.certifications,
		},
		{ onConflict: "profile_id" },
	);

	if (error) throw error;
}