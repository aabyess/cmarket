// app/api/chat/image-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

const BUCKET = "chat-images";
const EXPIRES_IN_SECONDS = 60 * 10;

export async function GET(req: NextRequest): Promise<NextResponse> {
	const quoteId = req.nextUrl.searchParams.get("quoteId");
	const storagePath = req.nextUrl.searchParams.get("storagePath");

	if (!quoteId || !storagePath) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: quote } = await admin
		.from("quotes")
		.select("seller_id, listings(user_id)")
		.eq("id", quoteId)
		.single();

	const buyerId = (quote?.listings as unknown as { user_id: string } | null)?.user_id;
	if (!quote || (quote.seller_id !== user.id && buyerId !== user.id)) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	// storagePath가 실제로 이 견적의 image 메시지 첨부인지 확인한다 —
	// 당사자라 해도 다른 방의 storagePath를 넣어 조회하는 걸 막는다.
	const { data: message } = await admin
		.from("messages")
		.select("id")
		.eq("quote_id", quoteId)
		.eq("message_type", "image")
		.eq("attachment_url", storagePath)
		.limit(1)
		.maybeSingle();

	if (!message) {
		return NextResponse.json({ error: "해당 이미지를 찾을 수 없습니다." }, { status: 404 });
	}

	const { data: signed, error } = await admin.storage
		.from(BUCKET)
		.createSignedUrl(storagePath, EXPIRES_IN_SECONDS);

	if (error || !signed) {
		return NextResponse.json({ error: error?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	return NextResponse.json({ url: signed.signedUrl });
}
