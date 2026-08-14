// utils/formatRelativeTime.ts

export function formatRelativeTime(isoString: string): string {
	const diffMs = Date.now() - new Date(isoString).getTime();
	const diffMinutes = Math.floor(diffMs / 60000);

	if (diffMinutes < 1) return "방금";
	if (diffMinutes < 60) return `${diffMinutes}분 전`;

	const diffHours = Math.floor(diffMinutes / 60);
	if (diffHours < 24) return `${diffHours}시간 전`;

	const diffDays = Math.floor(diffHours / 24);
	if (diffDays === 1) return "어제";
	if (diffDays < 7) return `${diffDays}일 전`;

	const date = new Date(isoString);
	return `${date.getMonth() + 1}.${date.getDate()}`;
}
