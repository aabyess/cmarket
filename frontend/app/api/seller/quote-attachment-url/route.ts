import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";

const BUCKET = "quote-attachments";
const EXPIRES_IN_SECONDS = 60 * 5;

export async function GET(req: NextRequest): Promise<NextResponse> {
	const quoteId = req.nextUrl.searchParams.get("quoteId");
	const storagePath = req.nextUrl.searchParams.get("storagePath");

	if (!quoteId || !storagePath) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const { data: quote } = await admin
		.from("quotes")
		.select("seller_id, listing_id, attachments")
		.eq("id", quoteId)
		.single();

	if (!quote) {
		return NextResponse.json({ error: "견적을 찾을 수 없습니다." }, { status: 404 });
	}

	const { data: listing } = await admin
		.from("listings")
		.select("user_id")
		.eq("id", quote.listing_id)
		.single();

	// 견적을 낸 셀러 본인이거나, 그 견적이 달린 공고의 바이어만 첨부를 열 수 있다.
	const isOwnerSeller = user.id === quote.seller_id;
	const isListingBuyer = listing?.user_id === user.id;
	if (!isOwnerSeller && !isListingBuyer) {
		return NextResponse.json({ error: "열람 권한이 없습니다." }, { status: 403 });
	}

	const attachments = (quote.attachments ?? []) as { storagePath: string }[];
	if (!attachments.some((attachment) => attachment.storagePath === storagePath)) {
		return NextResponse.json({ error: "해당 견적의 첨부가 아닙니다." }, { status: 400 });
	}

	const { data, error } = await admin.storage
		.from(BUCKET)
		.createSignedUrl(storagePath, EXPIRES_IN_SECONDS);

	if (error || !data) {
		return NextResponse.json({ error: error?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	return NextResponse.json({ url: data.signedUrl });
}
