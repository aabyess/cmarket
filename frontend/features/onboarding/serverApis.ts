// features/onboarding/serverApis.ts
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import type { OnboardingChecklist, OnboardingChecklistItem } from "@/features/onboarding/types";

export async function getOnboardingChecklist(role: "buyer" | "seller"): Promise<OnboardingChecklist> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { items: [], allCompleted: true };

	const t = await getTranslations("OnboardingChecklist");

	const [{ data: company }, firstActionResult, bankAccountResult, { data: profile }] = await Promise.all([
		supabase.from("companies").select("verification_status").eq("profile_id", user.id).maybeSingle(),
		role === "buyer"
			? supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id)
			: supabase.from("quotes").select("id", { count: "exact", head: true }).eq("seller_id", user.id),
		role === "seller"
			? supabase.from("bank_accounts").select("id").eq("profile_id", user.id).eq("is_primary", true).maybeSingle()
			: Promise.resolve(null),
		supabase.from("company_profiles").select("logo_url").eq("profile_id", user.id).maybeSingle(),
	]);

	const items: OnboardingChecklistItem[] = [
		{
			kind: "verification",
			completed: (company?.verification_status ?? "unverified") !== "unverified",
			label: t("itemVerification"),
			href: `/${role}/settings`,
		},
		{
			kind: "firstAction",
			completed: (firstActionResult?.count ?? 0) > 0,
			label: role === "buyer" ? t("itemFirstActionBuyer") : t("itemFirstActionSeller"),
			href: role === "buyer" ? "/buyer/post-listing" : "/seller/listing-browse",
		},
		{
			kind: "logo",
			completed: Boolean(profile?.logo_url),
			label: t("itemLogo"),
			href: `/${role}/profile/edit?tab=settings`,
		},
	];

	if (role === "seller") {
		items.splice(2, 0, {
			kind: "bankAccount",
			completed: Boolean(bankAccountResult?.data),
			label: t("itemBankAccount"),
			href: "/seller/settings",
		});
	}

	return { items, allCompleted: items.every((item) => item.completed) };
}
