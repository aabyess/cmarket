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
		const res = await fetch("/api/translate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ text, targetLang }),
		});
		if (!res.ok) return null;
		const data = await res.json();
		if (!data.translatedText) return null;
		return { translatedText: data.translatedText, detectedLang: data.detectedLang };
	} catch {
		return null;
	}
}

export async function translateField(text: string): Promise<FieldTranslationResult | null> {
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
