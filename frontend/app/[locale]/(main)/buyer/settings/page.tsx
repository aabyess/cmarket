// app/[locale]/(main)/buyer/settings/page.tsx
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import { getCompanyVerification } from "@/features/verification/serverApis";

export default async function BuyerSettingsPage(): Promise<React.JSX.Element> {
	const supabase = await createServerSupabaseClient();
	const [
		{
			data: { user },
		},
		t,
	] = await Promise.all([supabase.auth.getUser(), getTranslations("Settings")]);

	let country: "korea" | "indonesia" | null = null;
	let businessNumber = "";
	const verification = user ? await getCompanyVerification(user.id) : null;

	if (user) {
		const admin = await createServerAdminClient();
		const [{ data: profile }, { data: company }] = await Promise.all([
			admin.from("profiles").select("country").eq("id", user.id).maybeSingle(),
			admin.from("companies").select("business_number").eq("profile_id", user.id).maybeSingle(),
		]);
		country = profile?.country ?? null;
		businessNumber = company?.business_number ?? "";
	}

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("subtitle")}</p>
			</div>
			<SettingsPage
				role="buyer"
				email={user?.email ?? ""}
				bankAccount={null}
				country={country}
				businessNumber={businessNumber}
				verification={verification}
			/>
		</div>
	);
}
