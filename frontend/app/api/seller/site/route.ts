import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { SITE_PAGE_LOCALE, SITE_PAGE_SLUG } from "@/features/siteBuilder/constants";
import { isBlockArray } from "@/features/siteBuilder/utils";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { blocks, note } = await req.json();

	if (!isBlockArray(blocks)) {
		return NextResponse.json({ error: "블록 형식이 올바르지 않습니다." }, { status: 400 });
	}

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
		.select("id")
		.eq("tenant_id", company.site_tenant_id)
		.eq("slug", SITE_PAGE_SLUG)
		.eq("locale", SITE_PAGE_LOCALE)
		.maybeSingle();

	if (!page) {
		return NextResponse.json({ error: "홈페이지 정보를 찾을 수 없습니다." }, { status: 404 });
	}

	const { data: latest } = await demo
		.from("page_revision")
		.select("version")
		.eq("page_id", page.id)
		.order("version", { ascending: false })
		.limit(1)
		.maybeSingle();

	const { data: revision, error: revisionError } = await demo
		.from("page_revision")
		.insert({
			tenant_id: company.site_tenant_id,
			page_id: page.id,
			version: (latest?.version ?? 0) + 1,
			blocks,
			note: note ?? null,
			created_by: user.id,
		})
		.select("id")
		.single();

	if (revisionError) {
		return NextResponse.json({ error: revisionError.message }, { status: 500 });
	}

	const { error: pageError } = await demo
		.from("site_page")
		.update({ draft_revision_id: revision.id })
		.eq("id", page.id);

	if (pageError) {
		return NextResponse.json({ error: pageError.message }, { status: 500 });
	}

	return NextResponse.json({ revisionId: revision.id });
}
