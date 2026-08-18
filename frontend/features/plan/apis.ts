import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { FREE_PLAN_MONTHLY_CHAT_LIMIT, type Plan } from "@/constants/plan";

export type PlanInfo = {
	plan: Plan;
	chatUsageThisMonth: number;
	chatLimit: number | null;
};

export async function getPlanInfo(): Promise<PlanInfo | null> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const admin = await createServerAdminClient();

	const { data: profile } = await admin.from("profiles").select("plan").eq("id", user.id).single();
	const plan: Plan = profile?.plan ?? "free";

	if (plan !== "free") {
		return { plan, chatUsageThisMonth: 0, chatLimit: null };
	}

	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	startOfMonth.setHours(0, 0, 0, 0);

	const { count } = await admin
		.from("messages")
		.select("*", { count: "exact", head: true })
		.eq("sender_id", user.id)
		.gte("created_at", startOfMonth.toISOString());

	return { plan, chatUsageThisMonth: count ?? 0, chatLimit: FREE_PLAN_MONTHLY_CHAT_LIMIT };
}
