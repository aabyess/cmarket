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

	const { error } = await demo
		.from("site_page")
		.update({ published_revision_id: page.draft_revision_id, status: "PUBLISHED" })
		.eq("id", page.id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ publishedRevisionId: page.draft_revision_id });
}
