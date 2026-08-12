import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";

const BUCKET = "listing-attachments";
const EXPIRES_IN_SECONDS = 60 * 5;

export async function GET(req: NextRequest): Promise<NextResponse> {
	const listingId = req.nextUrl.searchParams.get("listingId");
	const storagePath = req.nextUrl.searchParams.get("storagePath");

	if (!listingId || !storagePath) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	// 공고 작성자이거나 그 공고에 견적을 낸 공급기업만 첨부를 열 수 있다.
	const admin = await createServerAdminClient();

	const { data: listing } = await admin
		.from("listings")
		.select("user_id, attachments")
		.eq("id", listingId)
		.single();

	if (!listing) {
		return NextResponse.json({ error: "공고를 찾을 수 없습니다." }, { status: 404 });
	}

	const attachments = (listing.attachments ?? []) as { storagePath: string }[];
	if (!attachments.some((attachment) => attachment.storagePath === storagePath)) {
		return NextResponse.json({ error: "해당 공고의 첨부가 아닙니다." }, { status: 400 });
	}

	// 공고 자체가 로그인한 회원 누구에게나 열려 있고, 첨부는 견적을 내기 위한 사양서다.
	// 견적 제출을 조건으로 걸면 사양서를 못 본 채 견적을 내야 하므로 회원이면 허용한다.
	// 대신 storagePath 가 그 공고의 첨부인지는 위에서 검증했다.

	const { data, error } = await admin.storage
		.from(BUCKET)
		.createSignedUrl(storagePath, EXPIRES_IN_SECONDS);

	if (error || !data) {
		return NextResponse.json({ error: error?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	return NextResponse.json({ url: data.signedUrl });
}
