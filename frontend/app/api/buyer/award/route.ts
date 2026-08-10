import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

export async function GET(req: NextRequest): Promise<NextResponse> {
	const path = req.nextUrl.searchParams.get("path");
	if (!path) {
		return NextResponse.json({ error: "path가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const { data: { user } } = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const decodedPath = decodeURIComponent(path);
	const parts = decodedPath.split("/");
	// 견적서: quoteId/timestamp.pdf
	// 인보이스: invoices/quoteId/timestamp.pdf
	const quoteId = parts[0] === "invoices" ? parts[1] : parts[0];

	const admin = await createServerAdminClient();

	const { data: quote } = await admin
		.from("quotes")
		.select("listing_id, seller_id")
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

	if (!listing || (listing.user_id !== user.id && quote.seller_id !== user.id)) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const { data: signed, error } = await admin.storage
		.from("quote-documents")
		.createSignedUrl(decodedPath, 60 * 10);

	if (error || !signed) {
		return NextResponse.json({ error: error?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	return NextResponse.json({ url: signed.signedUrl });
}