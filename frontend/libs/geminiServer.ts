// libs/geminiServer.ts
const GEMINI_API_URL =
	"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;

export class GeminiError extends Error {
	code: string;

	constructor(code: string, message: string) {
		super(message);
		this.name = "GeminiError";
		this.code = code;
	}
}

type JsonSchema = Record<string, unknown>;

type CallGeminiJsonParams = {
	system: string;
	prompt: string;
	schema: JsonSchema;
	maxOutputTokens?: number;
};

// Gemini generateContent를 responseMimeType: "application/json" + responseSchema로 강제해
// 구조화된 JSON을 받는 공용 헬퍼. 특정 기능에 종속되지 않으니 다른 AI 기능에서도 재사용하면 된다.
export async function callGeminiJson<T>({
	system,
	prompt,
	schema,
	maxOutputTokens = DEFAULT_MAX_OUTPUT_TOKENS,
}: CallGeminiJsonParams): Promise<T> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new GeminiError("AI_NOT_CONFIGURED", "GEMINI_API_KEY가 설정되지 않았습니다.");
	}

	const res = await fetch(GEMINI_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-goog-api-key": apiKey,
		},
		body: JSON.stringify({
			systemInstruction: { parts: [{ text: system }] },
			contents: [{ role: "user", parts: [{ text: prompt }] }],
			generationConfig: {
				maxOutputTokens,
				responseMimeType: "application/json",
				responseSchema: schema,
			},
		}),
	});

	if (res.status === 429) {
		throw new GeminiError("AI_RATE_LIMITED", "요청이 많아 잠시 후 다시 시도해주세요.");
	}

	if (!res.ok) {
		const body = await res.text();
		throw new GeminiError("AI_REQUEST_FAILED", `Gemini API 오류 (${res.status}): ${body}`);
	}

	const data = await res.json();
	const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

	if (typeof text !== "string" || !text.trim()) {
		throw new GeminiError("AI_REQUEST_FAILED", "Gemini 응답이 비어 있습니다.");
	}

	try {
		return JSON.parse(text) as T;
	} catch {
		throw new GeminiError("AI_REQUEST_FAILED", "Gemini 응답을 파싱할 수 없습니다.");
	}
}
