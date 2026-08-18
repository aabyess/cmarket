import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

const ERROR_MESSAGES: Record<string, string> = {
	QUOTE_NOT_FOUND: "견적을 찾을 수 없습니다.",
	LISTING_NOT_FOUND: "공고를 찾을 수 없습니다.",
	FORBIDDEN: "권한이 없습니다.",
	LISTING_ALREADY_AWARDED: "이미 마감된 공고입니다.",
	ALREADY_AWARDED: "이미 확정된 견적입니다.",
};

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { quoteId } = await req.json();
	if (!quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: quote } = await admin.from("quotes").select("seller_id").eq("id", quoteId).single();

	const { data: contractId, error } = await admin.rpc("award_quote", {
		p_quote_id: quoteId,
		p_buyer_id: user.id,
	});

	if (error) {
		const message = ERROR_MESSAGES[error.message] ?? "계약 확정 처리 중 오류가 발생했습니다.";
		const status = error.message === "FORBIDDEN" ? 403 : error.message === "QUOTE_NOT_FOUND" ? 404 : 400;
		return NextResponse.json({ error: message }, { status });
	}

	let invoiceWarning: string | null = null;
	if (quote?.seller_id) {
		const { data: bankAccount } = await admin
			.from("bank_accounts")
			.select("id")
			.eq("profile_id", quote.seller_id)
			.eq("is_primary", true)
			.maybeSingle();

		if (!bankAccount) {
			invoiceWarning = "공급기업이 아직 계좌 정보를 등록하지 않아 인보이스 발행이 지연될 수 있습니다.";
		}
	}

	return NextResponse.json({ contractId, invoiceWarning });
}
