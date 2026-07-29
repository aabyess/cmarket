import { createClient } from "@/libs/supabase";

export async function postLogin({ email, password }: { email: string; password: string }) {
	const supabase = createClient();
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
	return data;
}

export async function postLogout() {
	const supabase = createClient();
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}