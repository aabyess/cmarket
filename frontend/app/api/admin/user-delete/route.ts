// app/api/admin/user-delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

/** 운영자 여부는 RLS 가 최종 판단한다. 여기서는 이른 실패로 메시지를 명확히 할 뿐이다. */
async function requireAdmin(): Promise<{ userId: string } | null> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) return null;

	const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
	return data?.role === "admin" ? { userId: user.id } : null;
}

// companies/contacts/listing_templates 등 일부 테이블은 마이그레이션 이력에 create table가
// 없어(추적 도입 이전 생성) FK on delete 설정을 정적으로 확인할 수 없었다. cascade가 걸려있든
// 아니든 항상 성공하도록, 관련 행을 자식→부모 순서로 명시적으로 먼저 지운다.
async function deleteUserCascade(
	admin: Awaited<ReturnType<typeof createServerAdminClient>>,
	profileId: string,
): Promise<void> {
	const { data: ownListings } = await admin.from("listings").select("id").eq("user_id", profileId);
	const listingIds = (ownListings ?? []).map((row) => row.id);

	const { data: sellerQuotes } = await admin.from("quotes").select("id").eq("seller_id", profileId);
	const { data: listingQuotes } = listingIds.length
		? await admin.from("quotes").select("id").in("listing_id", listingIds)
		: { data: [] as { id: string }[] };

	const quoteIds = [
		...new Set([...(sellerQuotes ?? []).map((row) => row.id), ...(listingQuotes ?? []).map((row) => row.id)]),
	];

	if (quoteIds.length > 0) {
		await admin.from("messages").delete().in("quote_id", quoteIds);
		await admin.from("chat_hidden_rooms").delete().in("quote_id", quoteIds);
		// 이 견적에 대한 알림은 상대방(target이 아닌 쪽) profile_id로도 존재할 수 있다 —
		// profile_id만 기준으로 지우면 quotes.id를 참조하는 그 행이 남아 quote 삭제가 막힌다.
		await admin.from("notifications").delete().in("quote_id", quoteIds);

		const { data: contracts } = await admin.from("contracts").select("id").in("quote_id", quoteIds);
		const contractIds = (contracts ?? []).map((row) => row.id);
		if (contractIds.length > 0) {
			await admin.from("reviews").delete().in("contract_id", contractIds);
			await admin.from("contracts").delete().in("id", contractIds);
		}

		await admin.from("quotes").delete().in("id", quoteIds);
	}

	// 위에서 다루지 못한 경우(예: quote 없이 남은 계약/리뷰)에 대한 안전망.
	await admin.from("reviews").delete().or(`reviewer_id.eq.${profileId},reviewee_id.eq.${profileId}`);
	await admin.from("contracts").delete().or(`buyer_id.eq.${profileId},seller_id.eq.${profileId}`);

	await admin.from("listings").delete().eq("user_id", profileId);
	await admin.from("notifications").delete().eq("profile_id", profileId);
	await admin.from("bank_accounts").delete().eq("profile_id", profileId);
	await admin.from("listing_templates").delete().eq("profile_id", profileId);
	await admin.from("chat_hidden_rooms").delete().eq("profile_id", profileId);
	await admin.from("contacts").delete().eq("profile_id", profileId);
	await admin.from("companies").delete().eq("profile_id", profileId);
	await admin.from("profiles").delete().eq("id", profileId);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const body = await parseJsonBody<{ profileId?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { profileId } = body;
	if (!profileId) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	// UI에서도 본인 행은 숨기지만, 직접 API 호출로 우회할 수 있으니 서버에서도 막는다.
	if (profileId === admin.userId) {
		return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
	}

	const adminSupabase = await createServerAdminClient();

	const { data: target } = await adminSupabase.from("profiles").select("role").eq("id", profileId).maybeSingle();
	if (!target) {
		return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
	}
	if (target.role === "admin") {
		return NextResponse.json({ error: "운영자 계정은 삭제할 수 없습니다." }, { status: 400 });
	}

	await deleteUserCascade(adminSupabase, profileId);

	const { error: authError } = await adminSupabase.auth.admin.deleteUser(profileId);
	if (authError) {
		return NextResponse.json({ error: authError.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
