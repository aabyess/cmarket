export function resolveTranslatedField(
	original: string,
	sourceLang: string | null,
	translations: Record<string, string> | null,
	viewerLocale: string,
): string {
	if (!sourceLang || viewerLocale === sourceLang) return original;
	return translations?.[viewerLocale] ?? original;
}
