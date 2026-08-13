import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { getAuthHeaders } from "@/utils/authHeaders";

export async function getServerUserRole(): Promise<"buyer" | "seller" | "admin" | null> {
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
	role: "buyer" | "seller" | "admin";
	country: "indonesia" | "korea";
	companyName: string;
	email: string;
	name: string;
};

export async function getUserSummary(): Promise<UserSummary | null> {
	const supabase = await createServerSupabaseClient();
	const authHeaders = await getAuthHeaders();

	let userId: string;
	let email: string;

	if (authHeaders) {
		userId = authHeaders.userId;
		email = authHeaders.email;
	} else {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return null;
		userId = user.id;
		email = user.email ?? "";
	}

	const [profileResult, companyResult, contactResult] = await Promise.all([
		supabase.from("profiles").select("role, country").eq("id", userId).single(),
		supabase.from("companies").select("company_name").eq("profile_id", userId).single(),
		supabase.from("contacts").select("name").eq("profile_id", userId).single(),
	]);

	if (!profileResult.data) return null;

	return {
		role: authHeaders?.role ?? profileResult.data.role,
		country: profileResult.data.country,
		companyName: companyResult.data?.company_name ?? "",
		email,
		name: contactResult.data?.name ?? "",
	};
}