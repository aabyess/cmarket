// features/verification/serverApis.ts
import { createServerAdminClient } from "@/libs/supabaseServer";
import type { CompanyVerification, VerificationQueueItem } from "@/features/verification/types";

export async function getCompanyVerification(profileId: string): Promise<CompanyVerification | null> {
	const admin = await createServerAdminClient();

	const { data } = await admin
		.from("companies")
		.select(
			"verification_status, verification_method, verified_at, verification_document_url, verification_note, verification_requested_at",
		)
		.eq("profile_id", profileId)
		.maybeSingle();

	if (!data) return null;

	return {
		status: data.verification_status,
		method: data.verification_method,
		verifiedAt: data.verified_at,
		documentUrl: data.verification_document_url,
		note: data.verification_note,
		requestedAt: data.verification_requested_at,
	};
}

export async function getVerificationQueue(): Promise<VerificationQueueItem[]> {
	const admin = await createServerAdminClient();

	const { data, error } = await admin
		.from("companies")
		.select(
			"profile_id, company_name, business_number, nib, verification_status, verification_method, verification_document_url, verification_requested_at, verification_note",
		)
		.neq("verification_status", "unverified")
		.order("verification_requested_at", { ascending: false });

	if (error) throw new Error(error.message);
	if (!data || data.length === 0) return [];

	const { data: profiles } = await admin
		.from("profiles")
		.select("id, country")
		.in(
			"id",
			data.map((row) => row.profile_id),
		);

	const countryMap = new Map((profiles ?? []).map((row) => [row.id, row.country]));

	return data.map((row) => ({
		profileId: row.profile_id,
		companyName: row.company_name,
		country: countryMap.get(row.profile_id) ?? null,
		businessNumber: row.business_number,
		nib: row.nib,
		status: row.verification_status,
		method: row.verification_method,
		documentUrl: row.verification_document_url,
		requestedAt: row.verification_requested_at,
		note: row.verification_note,
	}));
}
