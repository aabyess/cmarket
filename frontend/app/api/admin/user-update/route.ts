// app/api/admin/user-update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

const MIN_PASSWORD_LENGTH = 8;

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

type UserUpdateBody = {
	profileId?: string;
	username?: string;
	password?: string;
	companyName?: string;
	representative?: string;
	businessNumber?: string;
	npwp?: string;
	nib?: string;
	address?: string;
	businessType?: string;
	businessItem?: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
	const admin = await requireAdmin();
	if (!admin) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });

	const body = await parseJsonBody<UserUpdateBody>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { profileId, username, password, companyName, representative, businessNumber, npwp, nib, address, businessType, businessItem } = body;
	if (!profileId) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}
	if (password && password.length < MIN_PASSWORD_LENGTH) {
		return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
	}

	const adminSupabase = await createServerAdminClient();

	const { data: target } = await adminSupabase
		.from("profiles")
		.select("id, username, country")
		.eq("id", profileId)
		.maybeSingle();
	if (!target) {
		return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });
	}

	if (username && username !== target.username) {
		const { data: existing } = await adminSupabase
			.from("profiles")
			.select("id")
			.eq("username", username)
			.neq("id", profileId)
			.maybeSingle();
		if (existing) {
			return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 400 });
		}

		const { error: usernameError } = await adminSupabase
			.from("profiles")
			.update({ username })
			.eq("id", profileId);
		if (usernameError) {
			return NextResponse.json({ error: usernameError.message }, { status: 500 });
		}
	}

	if (password) {
		const { error: passwordError } = await adminSupabase.auth.admin.updateUserById(profileId, { password });
		if (passwordError) {
			return NextResponse.json({ error: passwordError.message }, { status: 500 });
		}
	}

	const companyUpdate: Record<string, string> = {};
	if (companyName !== undefined) companyUpdate.company_name = companyName;
	if (representative !== undefined) companyUpdate.representative = representative;
	if (businessNumber !== undefined) companyUpdate.business_number = businessNumber;
	if (npwp !== undefined) companyUpdate.npwp = npwp;
	if (nib !== undefined) companyUpdate.nib = nib;
	if (address !== undefined) companyUpdate.address = address;
	if (businessType !== undefined) companyUpdate.business_type = businessType;
	if (businessItem !== undefined) companyUpdate.business_item = businessItem;

	if (Object.keys(companyUpdate).length > 0) {
		// 인증에 쓰인 사업자번호(한국: business_number, 인도네시아: npwp/nib)가 바뀌면
		// 기존 인증은 더 이상 유효하지 않다 — 관리자가 이 값을 고치면 자동으로 미인증으로 되돌린다.
		const { data: company } = await adminSupabase
			.from("companies")
			.select("business_number, npwp, nib, verification_status")
			.eq("profile_id", profileId)
			.maybeSingle();

		const businessIdChanged =
			(businessNumber !== undefined && businessNumber !== company?.business_number) ||
			(npwp !== undefined && npwp !== company?.npwp) ||
			(nib !== undefined && nib !== company?.nib);

		const resetVerification =
			businessIdChanged && company?.verification_status && company.verification_status !== "unverified";

		const { error: companyError } = await adminSupabase.from("companies").upsert(
			{
				profile_id: profileId,
				...companyUpdate,
				...(resetVerification
					? { verification_status: "unverified", verified_at: null, verification_note: null }
					: {}),
			},
			{ onConflict: "profile_id" },
		);
		if (companyError) {
			return NextResponse.json({ error: companyError.message }, { status: 500 });
		}
	}

	return NextResponse.json({ success: true });
}
