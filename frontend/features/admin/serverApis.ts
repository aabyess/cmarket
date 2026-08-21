// features/admin/serverApis.ts
import { createServerAdminClient } from "@/libs/supabaseServer";
import type { Plan } from "@/constants/plan";
import type { AdminUser } from "@/features/admin/types";

export async function getAdminUsers(): Promise<AdminUser[]> {
	const admin = await createServerAdminClient();

	const { data, error } = await admin
		.from("profiles")
		.select("id, role, country, plan, created_at, username")
		.order("created_at", { ascending: false });

	if (error) throw new Error(error.message);
	if (!data || data.length === 0) return [];

	const { data: companies } = await admin
		.from("companies")
		.select("profile_id, company_name, representative, business_number, npwp, nib, address, business_type, business_item")
		.in(
			"profile_id",
			data.map((row) => row.id),
		);

	const companyMap = new Map((companies ?? []).map((row) => [row.profile_id, row]));

	return data.map((row) => {
		const company = companyMap.get(row.id);

		return {
			id: row.id,
			role: row.role as AdminUser["role"],
			country: row.country as AdminUser["country"],
			plan: (row.plan ?? "free") as Plan,
			createdAt: row.created_at,
			username: row.username,
			companyName: company?.company_name ?? "",
			representative: company?.representative ?? "",
			businessNumber: company?.business_number ?? "",
			npwp: company?.npwp ?? "",
			nib: company?.nib ?? "",
			address: company?.address ?? "",
			businessType: company?.business_type ?? "",
			businessItem: company?.business_item ?? "",
		};
	});
}
