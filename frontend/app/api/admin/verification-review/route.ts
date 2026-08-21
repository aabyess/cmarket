// app/api/admin/verification-review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { translateFieldServer } from "@/libs/translateFieldServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

type AdminClient = Awaited<ReturnType<typeof createServerAdminClient>>;

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

// 알림 발송 실패가 승인/반려 처리 자체를 되돌리지는 않는다.
async function notifyApplicant(
	admin: AdminClient,
	{ profileId, approved, note }: { profileId: string; approved: boolean; note: string | null },
): Promise<void> {
	const title = approved ? "기업 인증이 완료됐어요" : "기업 인증이 반려됐어요";
	const content = approved ? "" : note ? `사유: ${note}` : "";

	const [titleTranslation, contentTranslation] = await Promise.all([
		translateFieldServer(title),
		translateFieldServer(content),
	]);

	const notificationRow = {
		profile_id: profileId,
		title,
		content,
		title_source_lang: titleTranslation?.sourceLang ?? null,
		title_translations: titleTranslation?.translations ?? null,
		content_source_lang: contentTranslation?.sourceLang ?? null,
		content_translations: contentTranslation?.translations ?? null,
	};

	// notifications.type에 check 제약이 있는 환경이면 실패하므로 "message"로 폴백한다.
	const { error } = await admin.from("notifications").insert({ ...notificationRow, type: "verification" });
	if (error) {
		const { error: fallbackError } = await admin
			.from("notifications")
			.insert({ ...notificationRow, type: "message" });
		if (fallbackError) {
			console.error("verification notificationError:", fallbackError);
		}
	}
}

export async function POST(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const body = await parseJsonBody<{ profileId?: string; action?: string; note?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { profileId, action, note } = body;
	if (!profileId || (action !== "approve" && action !== "reject")) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const trimmedNote = typeof note === "string" ? note.trim() : "";
	if (action === "reject" && !trimmedNote) {
		return NextResponse.json({ error: "반려 사유를 입력해주세요." }, { status: 400 });
	}

	const adminSupabase = await createServerAdminClient();

	const { data: company } = await adminSupabase
		.from("companies")
		.select("verification_status")
		.eq("profile_id", profileId)
		.maybeSingle();

	if (!company) {
		return NextResponse.json({ error: "기업 정보를 찾을 수 없습니다." }, { status: 404 });
	}
	if (company.verification_status !== "pending") {
		return NextResponse.json({ error: "심사 중인 신청만 처리할 수 있습니다." }, { status: 400 });
	}

	const updateData =
		action === "approve"
			? {
					verification_status: "verified" as const,
					verified_at: new Date().toISOString(),
					verification_note: null,
				}
			: {
					verification_status: "rejected" as const,
					verification_note: trimmedNote,
				};

	const { error } = await adminSupabase.from("companies").update(updateData).eq("profile_id", profileId);
	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	await notifyApplicant(adminSupabase, {
		profileId,
		approved: action === "approve",
		note: action === "reject" ? trimmedNote : null,
	});

	return NextResponse.json({ success: true });
}
