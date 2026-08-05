import { createClient } from "@/libs/supabase";

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

	const { data: authData, error: authError } = await supabase.auth.signUp({
		email: payload.email,
		password: payload.password,
	});

	if (authError) throw new Error(authError.message);
	const userId = authData.user?.id;
	if (!userId) throw new Error("유저 ID를 가져올 수 없습니다.");

	const { error: sessionError } = await supabase.auth.setSession({
		access_token: authData.session?.access_token ?? "",
		refresh_token: authData.session?.refresh_token ?? "",
	});
	if (sessionError) throw new Error(sessionError.message);

	const { error: profileError } = await supabase.from("profiles").insert({
		id: userId,
		role: "buyer",
		country: "indonesia",
		username: payload.username,
	});

	if (profileError) throw new Error(profileError.message);

	const { error: companyError } = await supabase.from("companies").insert({
		profile_id: userId,
		company_name: payload.companyName,
		representative: payload.representativeName,
		npwp: payload.npwp,
		nib: payload.nib,
		provinsi: payload.provinsi,
		city: payload.city,
		address: `${payload.addressBase} ${payload.addressDetail}`.trim(),
		business_type: payload.businessCategory,
		business_item: payload.businessItem,
	});

	if (companyError) throw new Error(companyError.message);

	const { error: contactError } = await supabase.from("contacts").insert({
		profile_id: userId,
		name: payload.managerName,
		title: payload.managerTitle,
		department: payload.managerDept,
		mobile: payload.mobile,
		phone: payload.phone,
		email: payload.email,
	});

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

	const { data: authData, error: authError } = await supabase.auth.signUp({
		email: payload.email,
		password: payload.password,
	});

	if (authError) throw new Error(authError.message);
	const userId = authData.user?.id;
	if (!userId) throw new Error("유저 ID를 가져올 수 없습니다.");

	const { error: sessionError } = await supabase.auth.setSession({
		access_token: authData.session?.access_token ?? "",
		refresh_token: authData.session?.refresh_token ?? "",
	});
	if (sessionError) throw new Error(sessionError.message);

	const { error: profileError } = await supabase.from("profiles").insert({
		id: userId,
		role: "seller",
		country: "korea",
		username: payload.username,
	});

	if (profileError) throw new Error(profileError.message);

	const { error: companyError } = await supabase.from("companies").insert({
		profile_id: userId,
		company_name: payload.companyName,
		representative: payload.representativeName,
		business_number: payload.businessNumber,
		address: `${payload.addressBase} ${payload.addressDetail}`.trim(),
		business_type: payload.businessCategory,
		business_item: payload.businessItem,
	});

	if (companyError) throw new Error(companyError.message);

	const { error: contactError } = await supabase.from("contacts").insert({
		profile_id: userId,
		name: payload.managerName,
		title: payload.managerTitle,
		department: payload.managerDept,
		mobile: payload.mobile,
		phone: payload.phone,
		email: payload.email,
	});

	if (contactError) throw new Error(contactError.message);
}

export async function getUserRole(): Promise<"buyer" | "seller" | null> {
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