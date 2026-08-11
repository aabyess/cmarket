import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
	"image/jpeg",
	"image/png",
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(request: NextRequest): Promise<NextResponse> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file") as File | null;

	if (!file) {
		return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
	}

	if (!ALLOWED_TYPES.includes(file.type)) {
		return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
	}

	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({ error: "파일 크기는 5MB를 초과할 수 없습니다." }, { status: 400 });
	}

	const admin = await createServerAdminClient();
	const path = `${user.id}/${Date.now()}-${file.name}`;

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