// app/api/settings/bank-account/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { upsertPrimaryBankAccount } from "@/features/siteBuilder/apis";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { bankName, accountNumber, accountHolder, swiftCode, currency } = await req.json();

	if (!bankName || !accountNumber || !accountHolder) {
		return NextResponse.json(
			{ error: "은행명, 계좌번호, 예금주를 입력해주세요." },
			{ status: 400 },
		);
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();
	const { error } = await upsertPrimaryBankAccount(admin, user.id, {
		bankName,
		accountNumber,
		accountHolder,
		swiftCode: swiftCode || "",
		currency: currency || "KRW",
	});

	if (error) {
		return NextResponse.json({ error }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
