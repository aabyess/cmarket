import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * 상세 설명 본문에 삽입되는 이미지.
 * 본문 HTML 에 <img src> 로 박히므로 만료되지 않는 주소가 필요하다.
 * 그래서 서명 URL 이 아니라 공개 버킷(product-images)에 올린다.
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
		return NextResponse.json({ error: "이미지 파일만 삽입할 수 있습니다." }, { status: 400 });
	}

	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({ error: "파일 크기는 5MB를 초과할 수 없습니다." }, { status: 400 });
	}

	const admin = await createServerAdminClient();
	const ext = file.name.split(".").pop() ?? "png";
	const path = `${user.id}/descriptions/${Date.now()}.${ext}`;

	const { error: uploadError } = await admin.storage
		.from("product-images")
		.upload(path, file, { contentType: file.type });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	const { data } = admin.storage.from("product-images").getPublicUrl(path);

	// 에디터는 url 을 그대로 <img src> 에 넣는다.
	return NextResponse.json({ url: data.publicUrl, storagePath: path });
}
