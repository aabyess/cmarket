import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/libs/supabaseServer";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { username, password } = await req.json();

	if (!username || !password) {
		return NextResponse.json(
			{ error: "아이디와 비밀번호를 입력해주세요." },
			{ status: 400 },
		);
	}

	const supabase = await createServerAdminClient();

	const { data: email, error: rpcError } = await supabase.rpc("get_email_by_username", {
		input_username: username,
	});

	if (rpcError || !email) {
		return NextResponse.json(
			{ error: "아이디 또는 비밀번호가 올바르지 않습니다." },
			{ status: 401 },
		);
	}

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