// app/api/buyer/listing-bookmarks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";

export async function GET(req: NextRequest): Promise<NextResponse> {
	const listingId = req.nextUrl.searchParams.get("listingId");
	if (!listingId) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}

	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const { data: listing } = await supabase
		.from("listings")
		.select("user_id")
		.eq("id", listingId)
		.single();

	if (!listing || listing.user_id !== user.id) {
		return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
	}

	// listing_bookmarks는 소유자 select 정책이 있어 사용자 클라이언트로 조회한다.
	const { data: bookmarks, error } = await supabase
		.from("listing_bookmarks")
		.select("profile_id, created_at")
		.eq("listing_id", listingId)
		.order("created_at", { ascending: false });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
	if (!bookmarks || bookmarks.length === 0) {
		return NextResponse.json({ bookmarkers: [] });
	}

	const profileIds = bookmarks.map((b) => b.profile_id);

	// companies/company_profiles는 남의 프로필이라 RLS가 막아 서비스 롤로 조회한다.
	const admin = await createServerAdminClient();
	const [{ data: companies }, { data: profiles }] = await Promise.all([
		admin
			.from("companies")
			.select("profile_id, company_name, verification_status")
			.in("profile_id", profileIds),
		admin.from("company_profiles").select("profile_id, logo_url").in("profile_id", profileIds),
	]);

	const companyMap = new Map((companies ?? []).map((c) => [c.profile_id, c]));
	const profileMap = new Map((profiles ?? []).map((p) => [p.profile_id, p]));

	const bookmarkers = bookmarks.map((b) => {
		const company = companyMap.get(b.profile_id);
		const profile = profileMap.get(b.profile_id);
		return {
			profileId: b.profile_id,
			companyName: company?.company_name ?? "",
			logoUrl: profile?.logo_url ?? null,
			verificationStatus: company?.verification_status ?? "unverified",
			bookmarkedAt: b.created_at,
		};
	});

	return NextResponse.json({ bookmarkers });
}
