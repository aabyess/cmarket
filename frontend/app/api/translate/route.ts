import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { parseJsonBody } from "@/utils/parseJsonBody";

// DeepL 유료 쿼터를 쓰는 프록시라 로그인 사용자만 허용하고 길이를 제한한다.
const MAX_TEXT_LENGTH = 5000;

export async function POST(req: NextRequest): Promise<NextResponse> {
	const supabase = await createServerSupabaseClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) {
		return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
	}

	const body = await parseJsonBody<{ text?: string; targetLang?: string }>(req);
	if (!body) {
		return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
	}
	const { text, targetLang } = body;

	if (!text?.trim()) {
		return NextResponse.json({ translatedText: null, detectedLang: null });
	}

	if (typeof text !== "string" || text.length > MAX_TEXT_LENGTH) {
		return NextResponse.json({ error: "번역할 텍스트가 너무 깁니다." }, { status: 400 });
	}

	const res = await fetch("https://api-free.deepl.com/v2/translate", {
		method: "POST",
		headers: {
			"Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			text: [text],
			target_lang: targetLang ?? "KO",
		}),
	});

	if (!res.ok) {
		return NextResponse.json({ error: "번역 실패" }, { status: 500 });
	}

	const data = await res.json();
	const translation = data.translations[0];

	return NextResponse.json({
		translatedText: translation.text,
		detectedLang: translation.detected_source_language,
	});
}
