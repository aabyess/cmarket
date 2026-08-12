export const BREADCRUMB_LABELS: { pattern: RegExp; label: string }[] = [
	{ pattern: /^\/buyer\/dashboard$/, label: "대시보드" },
	{ pattern: /^\/buyer\/order-list$/, label: "내 공고" },
	{ pattern: /^\/buyer\/post-listing$/, label: "공고 등록" },
	{ pattern: /^\/buyer\/listing\/[^/]+\/edit$/, label: "공고 수정" },
	{ pattern: /^\/buyer\/listing\/[^/]+$/, label: "공고 상세" },
	{ pattern: /^\/buyer\/quote-review$/, label: "받은 견적" },
	{ pattern: /^\/buyer\/chat$/, label: "채팅" },
	{ pattern: /^\/buyer\/contract$/, label: "계약 관리" },
	{ pattern: /^\/buyer\/profile\/edit$/, label: "기업 홈페이지" },

	{ pattern: /^\/seller\/dashboard$/, label: "대시보드" },
	{ pattern: /^\/seller\/listing-browse$/, label: "공고 탐색" },
	{ pattern: /^\/seller\/listing-browse\/[^/]+$/, label: "공고 상세" },
	{ pattern: /^\/seller\/quote-submit$/, label: "보낸 견적" },
	{ pattern: /^\/seller\/chat$/, label: "채팅" },
	{ pattern: /^\/seller\/contract$/, label: "계약 관리" },
	{ pattern: /^\/seller\/profile\/edit$/, label: "기업 홈페이지" },
];

export function getBreadcrumbLabel(pathname: string): string {
	const matched = BREADCRUMB_LABELS.find((entry) => entry.pattern.test(pathname));
	return matched?.label ?? "현재페이지";
}