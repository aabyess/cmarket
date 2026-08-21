// app/api/chat/send-info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { getPrimaryBankAccount } from "@/features/siteBuilder/apis";
import { parseJsonBody } from "@/utils/parseJsonBody";

type SendInfoBody = { quoteId?: string; kind?: "bankAccount" | "address" };

type ListingRow = {
	user_id: string;
	delivery_provinsi: string | null;
	delivery_city: string | null;
	delivery_address: string | null;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const body = await parseJsonBody<SendInfoBody>(req);
	const quoteId = body?.quoteId;
	const kind = body?.kind;

	if (!quoteId || (kind !== "bankAccount" && kind !== "address")) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}

	const admin = await createServerAdminClient();

	const { data: quote } = await admin
		.from("quotes")
		.select("seller_id, listings(user_id, delivery_provinsi, delivery_city, delivery_address)")
		.eq("id", quoteId)
		.single();

	const listing = quote?.listings as unknown as ListingRow | null;

	if (!quote || !listing) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	let content: string;

	if (kind === "bankAccount") {
		// 입금 계좌는 셀러 본인만 보낼 수 있다.
		if (quote.seller_id !== user.id) {
			return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
		}
		const bankAccount = await getPrimaryBankAccount(authClient, user.id);
		if (!bankAccount.bankName || !bankAccount.accountNumber) {
			return NextResponse.json(
				{ error: "정산 계좌를 먼저 등록해주세요.", code: "NO_BANK_ACCOUNT" },
				{ status: 422 },
			);
		}
		content = JSON.stringify({
			kind: "bankAccount",
			bankName: bankAccount.bankName,
			accountNumber: bankAccount.accountNumber,
			holder: bankAccount.accountHolder,
		});
	} else {
		// 납품지 주소는 바이어(공고 등록자) 본인만 보낼 수 있다.
		if (listing.user_id !== user.id) {
			return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
		}
		if (!listing.delivery_provinsi || !listing.delivery_city) {
			return NextResponse.json(
				{ error: "배송지 정보가 없습니다.", code: "NO_ADDRESS" },
				{ status: 422 },
			);
		}
		content = JSON.stringify({
			kind: "address",
			provinsi: listing.delivery_provinsi,
			city: listing.delivery_city,
			address: listing.delivery_address ?? "",
		});
	}

	// 계좌번호·주소는 자동 번역으로 왜곡되면 안 되므로 translations 컬럼 없이 저장한다.
	const { error: insertError } = await admin.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content,
		message_type: "info",
	});

	if (insertError) {
		return NextResponse.json({ error: insertError.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
