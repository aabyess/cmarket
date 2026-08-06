import { createServerSupabaseClient } from "@/libs/supabaseServer";

export async function getServerUserRole(): Promise<"buyer" | "seller" | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { session } } = await supabase.auth.getSession();
	const user = session?.user;
	if (!user) return null;

	const { data, error } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (error) return null;
	return data?.role ?? null;
}

export type UserSummary = {
	role: "buyer" | "seller";
	country: "indonesia" | "korea";
	companyName: string;
	email: string;
};

export async function getUserSummary(): Promise<UserSummary | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { session } } = await supabase.auth.getSession();
	const user = session?.user;
	if (!user) return null;

	const [profileResult, companyResult] = await Promise.all([
		supabase.from("profiles").select("role, country").eq("id", user.id).single(),
		supabase.from("companies").select("company_name").eq("profile_id", user.id).single(),
	]);

	if (!profileResult.data) return null;

	return {
		role: profileResult.data.role,
		country: profileResult.data.country,
		companyName: companyResult.data?.company_name ?? "",
		email: user.email ?? "",
	};
}