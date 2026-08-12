import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/zip",
];

/**
 * 공고 첨부(사양서·도면 등)를 비공개 버킷에 올린다.
 * 열람은 /api/buyer/attachment-url 이 발급하는 서명 URL 로만 가능하다.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
	}

	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({ error: "파일 크기는 5MB를 초과할 수 없습니다." }, { status: 400 });
	}

	const admin = await createServerAdminClient();
	// 파일명에 슬래시나 공백이 들어오면 경로가 어긋난다. 확장자만 살리고 나머지는 지운다.
	const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
	const path = `${user.id}/${Date.now()}-${safeName}`;

	const { error: uploadError } = await admin.storage
		.from("listing-attachments")
		.upload(path, file, { contentType: file.type });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	return NextResponse.json({
		storagePath: path,
		fileName: file.name,
		fileSize: file.size,
	});
}
