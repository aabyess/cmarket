// app/[locale]/admin/users/page.tsx
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { AdminUsersList } from "@/features/admin/components/AdminUsersList";
import { getAdminUsers } from "@/features/admin/serverApis";

export default async function AdminUsersPage(): Promise<React.JSX.Element> {
	const supabase = await createServerSupabaseClient();
	const [
		{
			data: { user },
		},
		users,
		t,
	] = await Promise.all([supabase.auth.getUser(), getAdminUsers(), getTranslations("AdminUsersPage")]);

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-6 lg:px-8">
			<div className="mb-5">
				<h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">{t("title")}</h1>
				<p className="mt-1 text-sm text-imsg-secondary">{t("summary", { count: users.length })}</p>
			</div>

			<AdminUsersList users={users} currentUserId={user?.id ?? ""} />
		</div>
	);
}
