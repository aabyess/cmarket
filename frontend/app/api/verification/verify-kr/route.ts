// app/api/verification/verify-kr/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

const NTS_VALIDATE_URL = "https://api.odcloud.kr/api/nts-businessman/v1/validate";

type NtsValidateResponse = {
	status_code?: string;
	data?: { b_no: string; valid: string; valid_msg?: string }[];
};

export async function POST(req: NextRequest): Promise<NextResponse> {
	const apiKey = process.env.NTS_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ error: "NTS_NOT_CONFIGURED" }, { status: 503 });
	}

	const body = await parseJsonBody<{
		businessNumber?: string;
		startDate?: string;
		representativeName?: string;
	}>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { businessNumber, startDate, representativeName } = body;
	if (!businessNumber || !startDate || !representativeName) {
		return NextResponse.json({ error: "필수 값이 없습니다." }, { status: 400 });
	}

	const bNo = businessNumber.replace(/\D/g, "");
	const startDt = startDate.replace(/\D/g, "");
	if (bNo.length !== 10 || startDt.length !== 8) {
		return NextResponse.json({ error: "사업자번호 또는 개업일자 형식이 올바르지 않습니다." }, { status: 400 });
	}

	const authClient = await createServerSupabaseClient();
	const {
		data: { user },
	} = await authClient.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const admin = await createServerAdminClient();

	const [{ data: profile }, { data: company }] = await Promise.all([
		admin.from("profiles").select("country").eq("id", user.id).maybeSingle(),
		admin.from("companies").select("business_number").eq("profile_id", user.id).maybeSingle(),
	]);

	if (profile?.country !== "korea") {
		return NextResponse.json({ error: "한국 계정만 이용할 수 있는 인증 방식입니다." }, { status: 400 });
	}

	// 국세청 진위확인은 "그 사업자번호가 실존하는지"만 확인할 뿐, 요청자 본인 소유인지는
	// 확인해주지 않는다 — 확인 없이 그대로 승인하면 공개된 타사 정보로도 내 회사를
	// 인증시킬 수 있어, 반드시 저장된 본인 사업자번호와 대조한 뒤에만 API를 호출한다.
	const registeredBNo = company?.business_number?.replace(/\D/g, "") ?? "";
	if (!registeredBNo) {
		return NextResponse.json({ error: "회사 정보에서 사업자번호를 먼저 등록해주세요." }, { status: 400 });
	}
	if (registeredBNo !== bNo) {
		return NextResponse.json(
			{ error: "회사 정보에 등록된 사업자번호와 일치해야 합니다." },
			{ status: 400 },
		);
	}

	let result: NtsValidateResponse;
	try {
		const res = await fetch(`${NTS_VALIDATE_URL}?serviceKey=${encodeURIComponent(apiKey)}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				businesses: [{ b_no: bNo, start_dt: startDt, p_nm: representativeName }],
			}),
		});
		result = await res.json();
	} catch (err) {
		console.error("NTS API request error:", err);
		return NextResponse.json({ error: "국세청 진위확인 요청에 실패했습니다." }, { status: 502 });
	}

	const matched = result.data?.[0];
	const isValid = result.status_code === "OK" && matched?.valid === "01";

	if (!isValid) {
		return NextResponse.json({
			verified: false,
			message: matched?.valid_msg || "입력하신 정보와 국세청 등록 정보가 일치하지 않습니다.",
		});
	}

	const { error: updateError } = await admin
		.from("companies")
		.update({
			verification_status: "verified",
			verification_method: "nts_api",
			verified_at: new Date().toISOString(),
			verification_note: null,
		})
		.eq("profile_id", user.id);

	if (updateError) {
		return NextResponse.json({ error: updateError.message }, { status: 500 });
	}

	return NextResponse.json({ verified: true });
}
