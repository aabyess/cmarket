import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { RESOURCE_BUCKET } from "@/features/support/constants";

const EXPIRES_IN_SECONDS = 60 * 5;

export async function GET(req: NextRequest): Promise<NextResponse> {
	const resourceId = req.nextUrl.searchParams.get("resourceId");
	if (!resourceId) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	// 발행된 자료만 내려준다. RLS 로도 막히지만 경로를 서버에서 정하므로 한 번 더 확인한다.
	const { data: resource } = await supabase
		.from("resources")
		.select("storage_path, published_at, download_count")
		.eq("id", resourceId)
		.maybeSingle();

	if (!resource?.published_at) {
		return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
	}

	const admin = await createServerAdminClient();
	const { data, error } = await admin.storage
		.from(RESOURCE_BUCKET)
		.createSignedUrl(resource.storage_path, EXPIRES_IN_SECONDS);

	if (error || !data) {
		return NextResponse.json({ error: error?.message ?? "URL 생성 실패" }, { status: 500 });
	}

	// 내려받은 횟수는 참고용이라 실패해도 응답을 막지 않는다.
	await admin
		.from("resources")
		.update({ download_count: (resource.download_count ?? 0) + 1 })
		.eq("id", resourceId);

	return NextResponse.json({ url: data.signedUrl });
}
