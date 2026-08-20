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

	// 절대 날짜(getMonth/getDate)는 서버 컴포넌트에서 호출될 때 서버 시간대(UTC) 기준이라
	// 한국/인도네시아 사용자에게 하루 어긋나 보인다. 시간대와 무관한 상대 표기로 통일한다.
	const diffWeeks = Math.floor(diffDays / 7);
	if (diffWeeks < 5) return t("weeksAgo", { count: diffWeeks });

	const diffMonths = Math.floor(diffDays / 30);
	if (diffMonths < 12) return t("monthsAgo", { count: diffMonths });

	// 일수(365) 기준으로 나누면 diffMonths가 12가 되는 360~364일 구간에서 "0년 전"이 나온다.
	// 개월 기준으로 나눠 경계를 일치시킨다.
	return t("yearsAgo", { count: Math.floor(diffMonths / 12) });
}
