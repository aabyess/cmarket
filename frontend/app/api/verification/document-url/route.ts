// app/api/verification/document-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";

export async function GET(req: NextRequest): Promise<NextResponse> {
	const profileId = req.nextUrl.searchParams.get("profileId");
	if (!profileId) {
		return NextResponse.json({ error: "profileId가 필요합니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	if (user.id !== profileId) {
		const { data: requesterProfile } = await admin
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.maybeSingle();
		if (requesterProfile?.role !== "admin") {
			return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
		}
	}

	const { data: company } = await admin
		.from("companies")
		.select("verification_document_url")
		.eq("profile_id", profileId)
		.maybeSingle();

	if (!company?.verification_document_url) {
		return NextResponse.json({ error: "제출된 서류가 없습니다." }, { status: 404 });
	}

	const { data: signed, error } = await admin.storage
		.from("verification-documents")
		.createSignedUrl(company.verification_document_url, 60 * 10);

	if (error || !signed) {
		return NextResponse.json({ error: error?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	return NextResponse.json({ url: signed.signedUrl });
}
