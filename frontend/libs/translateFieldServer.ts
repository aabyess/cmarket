export type SupportedLocale = "ko" | "id" | "en";

export type FieldTranslationResult = {
	sourceLang: string;
	translations: Partial<Record<SupportedLocale, string>>;
};

async function callTranslate(
	text: string,
	targetLang: string,
): Promise<{ translatedText: string; detectedLang: string } | null> {
	try {
		const res = await fetch("https://api-free.deepl.com/v2/translate", {
			method: "POST",
			headers: {
				Authorization: `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ text: [text], target_lang: targetLang }),
		});
		if (!res.ok) return null;
		const data = await res.json();
		const translation = data.translations?.[0];
		if (!translation) return null;
		return { translatedText: translation.text, detectedLang: translation.detected_source_language };
	} catch {
		return null;
	}
}

const DEEPL_TARGET: Record<SupportedLocale, string> = {
	ko: "KO",
	id: "ID",
	en: "EN-US",
};

/** DeepL로 지정한 언어 하나로만 번역한다. 실패하면 원문을 그대로 돌려준다. */
export async function translateTextServer(text: string, targetLocale: SupportedLocale): Promise<string> {
	if (!text?.trim()) return text;
	const result = await callTranslate(text, DEEPL_TARGET[targetLocale]);
	return result?.translatedText ?? text;
}

export async function translateFieldServer(text: string): Promise<FieldTranslationResult | null> {
	if (!text?.trim()) return null;

	const first = await callTranslate(text, "EN-US");
	if (!first) return null;

	const detected = first.detectedLang;
	const translations: Partial<Record<SupportedLocale, string>> = {};
	if (detected !== "EN") translations.en = first.translatedText;

	const remaining: { locale: SupportedLocale; deeplTarget: string }[] = [
		{ locale: "ko", deeplTarget: "KO" },
		{ locale: "id", deeplTarget: "ID" },
	].filter(({ deeplTarget }) => detected !== deeplTarget) as {
		locale: SupportedLocale;
		deeplTarget: string;
	}[];

	// 남은 언어들은 서로 독립이므로 병렬로 번역한다.
	const results = await Promise.all(
		remaining.map(({ deeplTarget }) => callTranslate(text, deeplTarget)),
	);
	remaining.forEach(({ locale }, i) => {
		const result = results[i];
		if (result) translations[locale] = result.translatedText;
	});

	const sourceLang =
		detected === "EN" ? "en" : detected === "KO" ? "ko" : detected === "ID" ? "id" : detected.toLowerCase();

	return { sourceLang, translations };
}
