// app/[locale]/(main)/buyer/settings/page.tsx
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export default async function BuyerSettingsPage(): Promise<React.JSX.Element> {
	const supabase = await createServerSupabaseClient();
	const [
		{
			data: { user },
		},
		t,
	] = await Promise.all([supabase.auth.getUser(), getTranslations("Settings")]);

	return (
		<div className="px-8 py-6 xl:px-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-[#1F2937]">{t("title")}</h1>
				<p className="mt-1 text-sm text-[#6B7280]">{t("subtitle")}</p>
			</div>
			<SettingsPage role="buyer" email={user?.email ?? ""} />
		</div>
	);
}
