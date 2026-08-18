import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { logoUrl, categories, bankAccount, company, contact } = await req.json();

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

	// 사업자등록번호는 받지 않는다. 인보이스·계약서에 찍히는 식별자라
	// 바뀌면 지난 거래의 상대방이 누구였는지가 흔들린다.
	if (company) {
		const [businessTypeTranslation, businessItemTranslation] = await Promise.all([
			translateFieldServer(company.businessType),
			translateFieldServer(company.businessItem),
		]);

		const { error: companyError } = await admin
			.from("companies")
			.update({
				company_name: company.companyName,
				representative: company.representative,
				business_type: company.businessType,
				business_type_source_lang: businessTypeTranslation?.sourceLang ?? null,
				business_type_translations: businessTypeTranslation?.translations ?? null,
				business_item: company.businessItem,
				business_item_source_lang: businessItemTranslation?.sourceLang ?? null,
				business_item_translations: businessItemTranslation?.translations ?? null,
				address: company.address,
			})
			.eq("profile_id", user.id);

		if (companyError) {
			return NextResponse.json({ error: companyError.message }, { status: 500 });
		}
	}

	// contacts 에 profile_id 유니크가 보장되지 않아 upsert 대신 있으면 갱신, 없으면 삽입한다.
	if (contact) {
		const row = {
			name: contact.name,
			title: contact.title || null,
			department: contact.department || null,
			email: contact.email || null,
			phone: contact.phone || null,
			mobile: contact.mobile || null,
		};

		const { data: existing } = await admin
			.from("contacts")
			.select("id")
			.eq("profile_id", user.id)
			.maybeSingle();

		const { error: contactError } = existing
			? await admin.from("contacts").update(row).eq("id", existing.id)
			: await admin.from("contacts").insert({ profile_id: user.id, ...row });

		if (contactError) {
			return NextResponse.json({ error: contactError.message }, { status: 500 });
		}
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
