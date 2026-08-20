// utils/htmlToPlainText.ts
import sanitize from "sanitize-html";

// HTML을 태그 없는 평문으로 변환한다. 정규식으로 태그만 잘라내면 &amp; 같은
// 엔티티가 그대로 남는 문제가 있어(PR #78 리뷰에서 지적됨), htmlparser2 기반
// 파서로 텍스트 노드만 추출해 엔티티를 정상적으로 디코딩한다.
export function htmlToPlainText(html: string, maxLength?: number): string {
	const text = sanitize(html, {
		allowedTags: [],
		allowedAttributes: {},
		textFilter: (text) => `${text} `,
	})
		.replace(/\s+/g, " ")
		.trim();

	return typeof maxLength === "number" ? text.slice(0, maxLength) : text;
}
