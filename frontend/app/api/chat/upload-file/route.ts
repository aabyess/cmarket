// app/api/chat/upload-file/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
// hwp/csv 등은 브라우저·OS에 따라 content-type이 비어 있거나 application/octet-stream으로
// 오는 경우가 흔해 신뢰할 수 없다. 확장자 기준으로 검증한다.
const ALLOWED_EXTENSIONS = [
	"pdf",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"ppt",
	"pptx",
	"zip",
	"csv",
	"txt",
	"hwp",
];
const BUCKET = "chat-files";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const formData = await req.formData();
	const quoteId = formData.get("quoteId");
	const file = formData.get("file");

	if (typeof quoteId !== "string" || !quoteId) {
		return NextResponse.json({ error: "quoteId가 필요합니다." }, { status: 400 });
	}
	if (!(file instanceof File) || file.size === 0) {
		return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
	}
	const extension = file.name.split(".").pop()?.toLowerCase();
	if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
		return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
	}
	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({ error: "파일 크기는 10MB를 초과할 수 없습니다." }, { status: 400 });
	}

	const admin = await createServerAdminClient();

	// /api/chat/message와 동일한 당사자 검증 패턴: 이 채팅의 참여자인지 먼저 확인한다.
	const { data: quote } = await admin
		.from("quotes")
		.select("seller_id, listings(user_id)")
		.eq("id", quoteId)
		.single();

	const buyerId = (quote?.listings as unknown as { user_id: string } | null)?.user_id;
	if (!quote || (quote.seller_id !== user.id && buyerId !== user.id)) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	const fileBuffer = await file.arrayBuffer();
	const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
	const storagePath = `${quoteId}/${user.id}/${Date.now()}-${safeName}`;

	const { error: uploadError } = await admin.storage
		.from(BUCKET)
		.upload(storagePath, fileBuffer, { contentType: file.type || "application/octet-stream" });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	const { error: insertError } = await admin.from("messages").insert({
		quote_id: quoteId,
		sender_id: user.id,
		content: file.name,
		message_type: "file",
		attachment_url: storagePath,
		attachment_name: file.name,
	});

	if (insertError) {
		return NextResponse.json({ error: insertError.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
