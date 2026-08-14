// utils/formatRelativeTime.ts

type RelativeTimeTranslator = (key: string, values?: Record<string, number>) => string;

export function formatRelativeTime(isoString: string, t: RelativeTimeTranslator): string {
	const diffMs = Date.now() - new Date(isoString).getTime();
	const diffMinutes = Math.floor(diffMs / 60000);

	if (diffMinutes < 1) return t("justNow");
	if (diffMinutes < 60) return t("minutesAgo", { count: diffMinutes });

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return t("hoursAgo", { count: diffHours });

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) return t("yesterday");
	if (diffDays < 7) return t("daysAgo", { count: diffDays });

	const date = new Date(isoString);
	return `${date.getMonth() + 1}.${date.getDate()}`;
}
