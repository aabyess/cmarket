import { createServerSupabaseClient } from "@/libs/supabaseServer";

export async function getServerUserRole(): Promise<"buyer" | "seller" | null> {
	const supabase = await createServerSupabaseClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;

	const { data, error } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (error) return null;
	return data?.role ?? null;
}