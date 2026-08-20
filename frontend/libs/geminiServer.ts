// libs/geminiServer.ts
// 최신 모델은 수요가 몰리면 일시적으로 503(UNAVAILABLE)을 반환하므로,
// 과부하 시 예비 모델로 순차 폴백한다.
const GEMINI_MODELS = ["gemini-3.7-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
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

function buildUrl(model: string): string {
	return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

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

	const body = JSON.stringify({
		systemInstruction: { parts: [{ text: system }] },
		contents: [{ role: "user", parts: [{ text: prompt }] }],
		generationConfig: {
			maxOutputTokens,
			responseMimeType: "application/json",
			responseSchema: schema,
		},
	});

	let lastOverloadedBody = "";

	for (const model of GEMINI_MODELS) {
		const res = await fetch(buildUrl(model), {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-goog-api-key": apiKey,
			},
			body,
		});

		// 과부하(503)면 다음 예비 모델로 넘어간다.
		if (res.status === 503) {
			lastOverloadedBody = await res.text();
			console.error(`Gemini ${model} 과부하(503), 다음 모델로 폴백`);
			continue;
		}

		if (res.status === 429) {
			throw new GeminiError("AI_RATE_LIMITED", "요청이 많아 잠시 후 다시 시도해주세요.");
		}

		if (!res.ok) {
			const errorBody = await res.text();
			throw new GeminiError("AI_REQUEST_FAILED", `Gemini API 오류 (${res.status}): ${errorBody}`);
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

	// 모든 모델이 과부하 — 사용자에게는 재시도 안내로 처리되도록 RATE_LIMITED로 분류한다.
	throw new GeminiError(
		"AI_RATE_LIMITED",
		`Gemini 모델이 모두 과부하 상태입니다: ${lastOverloadedBody.slice(0, 200)}`,
	);
}
