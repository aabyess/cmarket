import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { RESOURCE_BUCKET } from "@/features/support/constants";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

async function requireAdmin(): Promise<{ userId: string } | null> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
	return data?.role === "admin" ? { userId: user.id } : null;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const formData = await req.formData();
	const file = formData.get("file");
	const title = formData.get("title");
	const description = formData.get("description");

	if (!(file instanceof File)) {
		return NextResponse.json({ error: "파일을 선택해주세요." }, { status: 400 });
	}
	if (typeof title !== "string" || title.trim().length === 0) {
		return NextResponse.json({ error: "제목을 입력해주세요." }, { status: 400 });
	}
	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({ error: "파일 크기는 20MB를 초과할 수 없습니다." }, { status: 400 });
	}

	const service = await createServerAdminClient();
	const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
	const path = `${Date.now()}-${safeName}`;

	const { error: uploadError } = await service.storage
		.from(RESOURCE_BUCKET)
		.upload(path, file, { contentType: file.type });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	const supabase = await createServerSupabaseClient();
	const { error } = await supabase.from("resources").insert({
		title: title.trim(),
		description: typeof description === "string" ? description.trim() : null,
		file_name: file.name,
		storage_path: path,
		file_size: file.size,
		published_at: new Date().toISOString(),
		created_by: admin.userId,
	});

	if (error) {
		// 표 저장이 실패하면 올라간 파일은 아무도 못 찾는 쓰레기가 된다. 되돌린다.
		await service.storage.from(RESOURCE_BUCKET).remove([path]);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const id = req.nextUrl.searchParams.get("id");
	if (!id) return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });

	const supabase = await createServerSupabaseClient();
	const { data: resource } = await supabase
		.from("resources")
		.select("storage_path")
		.eq("id", id)
		.maybeSingle();

	const { error } = await supabase.from("resources").delete().eq("id", id);
	if (error) return NextResponse.json({ error: error.message }, { status: 500 });

	if (resource?.storage_path) {
		const service = await createServerAdminClient();
		await service.storage.from(RESOURCE_BUCKET).remove([resource.storage_path]);
	}

	return NextResponse.json({ success: true });
}
