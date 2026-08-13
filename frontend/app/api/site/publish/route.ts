import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { SITE_PAGE_LOCALE, SITE_PAGE_SLUG } from "@/features/siteBuilder/constants";

export async function POST(): Promise<NextResponse> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const { data: company } = await supabase
		.from("companies")
		.select("site_tenant_id")
		.eq("profile_id", user.id)
		.single();

	if (!company?.site_tenant_id) {
		return NextResponse.json({ error: "연결된 사이트가 없습니다." }, { status: 404 });
	}

	const demo = await createServerSupabaseClient("demo");

	const { data: page } = await demo
		.from("site_page")
		.select("id, draft_revision_id")
		.eq("tenant_id", company.site_tenant_id)
		.eq("slug", SITE_PAGE_SLUG)
		.eq("locale", SITE_PAGE_LOCALE)
		.maybeSingle();

	if (!page?.draft_revision_id) {
		return NextResponse.json({ error: "발행할 초안이 없습니다." }, { status: 400 });
	}

	// 발행은 포인터를 옮기는 UPDATE 한 번이다. RLS 로 막히면 0행이 갱신되고도
	// 에러가 나지 않으므로, 갱신된 행을 돌려받아 실제로 반영됐는지 확인한다.
	const { data: updated, error } = await demo
		.from("site_page")
		.update({ published_revision_id: page.draft_revision_id, status: "PUBLISHED" })
		.eq("id", page.id)
		.select("id, published_revision_id");

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	if (!updated || updated.length === 0) {
		return NextResponse.json(
			{ error: "발행 권한이 없습니다. demo.site_page 의 UPDATE 정책을 확인해주세요." },
			{ status: 403 },
		);
	}

	return NextResponse.json({ publishedRevisionId: page.draft_revision_id });
}
