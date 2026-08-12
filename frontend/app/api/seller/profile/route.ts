import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { logoUrl, categories, bankAccount } = await req.json();

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { error: profileError } = await admin.from("company_profiles").upsert(
		{
			profile_id: user.id,
			logo_url: logoUrl || null,
			categories: categories ?? [],
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "profile_id" },
	);

	if (profileError) {
		return NextResponse.json({ error: profileError.message }, { status: 500 });
	}

	if (bankAccount?.bankName) {
		const { error: bankError } = await admin.from("bank_accounts").upsert(
			{
				profile_id: user.id,
				bank_name: bankAccount.bankName,
				account_number: bankAccount.accountNumber,
				account_holder: bankAccount.accountHolder,
				swift_code: bankAccount.swiftCode || null,
				currency: bankAccount.currency || "KRW",
				is_primary: true,
				updated_at: new Date().toISOString(),
			},
			{ onConflict: "profile_id,is_primary" },
		);

		if (bankError) {
			return NextResponse.json({ error: bankError.message }, { status: 500 });
		}
	}

	return NextResponse.json({ success: true });
}
