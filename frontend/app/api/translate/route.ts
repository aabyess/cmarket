import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
	const { text, targetLang } = await req.json();

	if (!text?.trim()) {
		return NextResponse.json({ translatedText: null, detectedLang: null });
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