// app/api/quote/invalidate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { routing } from "@/i18n/routing";

const BUCKET = "quote-documents";

// 견적 수정 시 캐시된 견적 PDF를 지운다. PDF는 quote-{locale}.pdf 존재 여부로
// 영구 캐시되므로, 가격/납기 등이 바뀌면 다음 열람 때 새로 생성되도록 지워야 한다.
// 클라이언트는 이 버킷에 삭제 권한이 없어 서버에서 처리한다.
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

	if (!quote) {
		return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
	}

	if (quote.seller_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const { error } = await admin.storage
		.from(BUCKET)
		.remove(routing.locales.map((locale) => `${quoteId}/quote-${locale}.pdf`));

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
