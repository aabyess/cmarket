import { createClient } from "@/libs/supabase";
import { translateField } from "@/utils/translateField";

export async function postLogin({ username, password }: { username: string; password: string }) {
	const res = await fetch("/api/auth/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
	});

	if (!res.ok) {
		const { error } = await res.json();
		throw new Error(error ?? "로그인 실패");
	}

	return res.json();
}

export async function postLogout() {
	const supabase = createClient();
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
	const supabase = createClient();
	const { data, error } = await supabase.rpc("check_username_available", {
		input_username: username,
	});
	if (error) throw new Error(error.message);
	return data as boolean;
}

type ResumedSignupSession = {
	userId: string;
	accessToken: string;
	refreshToken: string;
};

// auth.signUp() 이후 profiles/companies/contacts insert 중 하나라도 실패하면(RLS, 네트워크 오류 등)
// auth.users에는 계정이 생겼지만 profile이 없는 상태로 남는다. 이 경우 재시도하면 signUp이
// "이미 가입됨" 에러를 반환해 사용자가 영구히 가입을 완료할 수 없었다. 같은 이메일/비밀번호로
// 로그인을 시도해 이어서 진행할 수 있게 한다 — 비밀번호가 다르면(타인이 이미 쓰는 이메일 등)
// 로그인도 실패하므로 원래 가입 에러를 그대로 보여준다.
// 주의: auth.users에 계정만 남고 사용자가 재시도하지 않는 경우(폼을 완전히 이탈)의
// 서버측 롤백/정리는 이 함수의 범위 밖이다.
async function signUpOrResume(
	supabase: ReturnType<typeof createClient>,
	email: string,
	password: string,
): Promise<ResumedSignupSession> {
	const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

	if (!authError) {
		const userId = authData.user?.id;
		if (!userId) throw new Error("유저 ID를 가져올 수 없습니다.");
		return {
			userId,
			accessToken: authData.session?.access_token ?? "",
			refreshToken: authData.session?.refresh_token ?? "",
		};
	}

	if (!/already registered|already exists/i.test(authError.message)) {
		throw new Error(authError.message);
	}

	const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
		email,
		password,
	});
	if (signInError || !signInData.user) {
		throw new Error(authError.message);
	}

	return {
		userId: signInData.user.id,
		accessToken: signInData.session?.access_token ?? "",
		refreshToken: signInData.session?.refresh_token ?? "",
	};
}

type SignupIndonesiaPayload = {
	username: string;
	password: string;
	email: string;
	managerName: string;
	managerTitle: string;
	managerDept: string;
	mobile: string;
	phone: string;
	fax: string;
	npwp: string;
	nib: string;
	companyName: string;
	representativeName: string;
	provinsi: string;
	city: string;
	addressBase: string;
	addressDetail: string;
	businessCategory: string;
	businessItem: string;
};

export async function signupIndonesia(payload: SignupIndonesiaPayload): Promise<void> {
	const supabase = createClient();

	const { userId, accessToken, refreshToken } = await signUpOrResume(
		supabase,
		payload.email,
		payload.password,
	);

	const { error: sessionError } = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken,
	});
	if (sessionError) throw new Error(sessionError.message);

	const { error: profileError } = await supabase
		.from("profiles")
		.upsert(
			{ id: userId, role: "buyer", country: "indonesia", username: payload.username },
			{ onConflict: "id" },
		);

	if (profileError) throw new Error(profileError.message);

	const [businessTypeTranslation, businessItemTranslation] = await Promise.all([
		translateField(payload.businessCategory),
		translateField(payload.businessItem),
	]);

	const { error: companyError } = await supabase.from("companies").upsert(
		{
			profile_id: userId,
			company_name: payload.companyName,
			representative: payload.representativeName,
			npwp: payload.npwp,
			nib: payload.nib,
			provinsi: payload.provinsi,
			city: payload.city,
			address: `${payload.addressBase} ${payload.addressDetail}`.trim(),
			business_type: payload.businessCategory,
			business_type_source_lang: businessTypeTranslation?.sourceLang ?? null,
			business_type_translations: businessTypeTranslation?.translations ?? null,
			business_item: payload.businessItem,
			business_item_source_lang: businessItemTranslation?.sourceLang ?? null,
			business_item_translations: businessItemTranslation?.translations ?? null,
		},
		{ onConflict: "profile_id" },
	);

	if (companyError) throw new Error(companyError.message);

	const { error: contactError } = await supabase.from("contacts").upsert(
		{
			profile_id: userId,
			name: payload.managerName,
			title: payload.managerTitle,
			department: payload.managerDept,
			mobile: payload.mobile,
			phone: payload.phone,
			email: payload.email,
		},
		{ onConflict: "profile_id" },
	);

	if (contactError) throw new Error(contactError.message);
}

type SignupKoreaPayload = {
	username: string;
	password: string;
	email: string;
	managerName: string;
	managerTitle: string;
	managerDept: string;
	mobile: string;
	phone: string;
	fax: string;
	businessNumber: string;
	companyName: string;
	representativeName: string;
	postcode: string;
	addressBase: string;
	addressDetail: string;
	businessCategory: string;
	businessItem: string;
};

export async function signupKorea(payload: SignupKoreaPayload): Promise<void> {
	const supabase = createClient();

	const { userId, accessToken, refreshToken } = await signUpOrResume(
		supabase,
		payload.email,
		payload.password,
	);

	const { error: sessionError } = await supabase.auth.setSession({
		access_token: accessToken,
		refresh_token: refreshToken,
	});
	if (sessionError) throw new Error(sessionError.message);

	const { error: profileError } = await supabase
		.from("profiles")
		.upsert(
			{ id: userId, role: "seller", country: "korea", username: payload.username },
			{ onConflict: "id" },
		);

	if (profileError) throw new Error(profileError.message);

	const [businessTypeTranslation, businessItemTranslation] = await Promise.all([
		translateField(payload.businessCategory),
		translateField(payload.businessItem),
	]);

	const { error: companyError } = await supabase.from("companies").upsert(
		{
			profile_id: userId,
			company_name: payload.companyName,
			representative: payload.representativeName,
			business_number: payload.businessNumber,
			address: `${payload.addressBase} ${payload.addressDetail}`.trim(),
			business_type: payload.businessCategory,
			business_type_source_lang: businessTypeTranslation?.sourceLang ?? null,
			business_type_translations: businessTypeTranslation?.translations ?? null,
			business_item: payload.businessItem,
			business_item_source_lang: businessItemTranslation?.sourceLang ?? null,
			business_item_translations: businessItemTranslation?.translations ?? null,
		},
		{ onConflict: "profile_id" },
	);

	if (companyError) throw new Error(companyError.message);

	const { error: contactError } = await supabase.from("contacts").upsert(
		{
			profile_id: userId,
			name: payload.managerName,
			title: payload.managerTitle,
			department: payload.managerDept,
			mobile: payload.mobile,
			phone: payload.phone,
			email: payload.email,
		},
		{ onConflict: "profile_id" },
	);

	if (contactError) throw new Error(contactError.message);
}

export async function getUserRole(): Promise<"buyer" | "seller" | "admin" | null> {
	const supabase = createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;

	const { data, error } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (error) return null;
	return data?.role ?? null;
}