// app/api/verification/verify-document/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(req: NextRequest): Promise<NextResponse> {
	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const formData = await req.formData();
	const file = formData.get("file");
	if (!(file instanceof File) || file.size === 0) {
		return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
	}
	if (!ALLOWED_TYPES.includes(file.type)) {
		return NextResponse.json({ error: "지원하지 않는 파일 형식입니다." }, { status: 400 });
	}
	if (file.size > MAX_FILE_SIZE) {
		return NextResponse.json({ error: "파일 크기는 5MB를 초과할 수 없습니다." }, { status: 400 });
	}

	const admin = await createServerAdminClient();

	const { data: company } = await admin
		.from("companies")
		.select("verification_status")
		.eq("profile_id", user.id)
		.maybeSingle();

	if (!company) {
		return NextResponse.json({ error: "기업 정보를 찾을 수 없습니다." }, { status: 404 });
	}
	if (company.verification_status === "verified") {
		return NextResponse.json({ error: "이미 인증된 기업입니다." }, { status: 400 });
	}

	const fileBuffer = await file.arrayBuffer();
	const fileExt = file.name.split(".").pop() ?? "pdf";
	const storagePath = `${user.id}/${Date.now()}.${fileExt}`;

	const { error: uploadError } = await admin.storage
		.from("verification-documents")
		.upload(storagePath, fileBuffer, { contentType: file.type });

	if (uploadError) {
		return NextResponse.json({ error: uploadError.message }, { status: 500 });
	}

	const { error: updateError } = await admin
		.from("companies")
		.update({
			verification_status: "pending",
			verification_method: "manual_document",
			verification_document_url: storagePath,
			verification_requested_at: new Date().toISOString(),
			verification_note: null,
		})
		.eq("profile_id", user.id);

	if (updateError) {
		return NextResponse.json({ error: updateError.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
