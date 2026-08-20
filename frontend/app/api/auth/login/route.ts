import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const body = await parseJsonBody<{ username?: string; password?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { username, password } = body;
	if (!username || !password) {
		return NextResponse.json(
			{ error: "아이디와 비밀번호를 입력해주세요." },
			{ status: 400 },
		);
	}

	// get_email_by_username은 admin 클라이언트로 (RPC 권한 필요)
	const admin = await createServerAdminClient();
	const { data: email, error: rpcError } = await admin.rpc("get_email_by_username", {
		input_username: username,
	});

	if (rpcError || !email) {
		return NextResponse.json(
			{ error: "아이디 또는 비밀번호가 올바르지 않습니다." },
			{ status: 401 },
		);
	}

	// signInWithPassword는 일반 클라이언트로 (쿠키 세션 저장 필요)
	const supabase = await createServerSupabaseClient();
	const { data, error } = await supabase.auth.signInWithPassword({
		email: email as string,
		password,
	});

	if (error) {
		return NextResponse.json(
			{ error: "아이디 또는 비밀번호가 올바르지 않습니다." },
			{ status: 401 },
		);
	}

	return NextResponse.json({ user: data.user });
}