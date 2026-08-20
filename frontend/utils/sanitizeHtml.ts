// utils/sanitizeHtml.ts
import sanitize from "sanitize-html";

// 에디터(Tiptap)가 만든 HTML을 렌더하기 전에 살균한다.
// 저장 경로가 클라이언트에서 직접 이뤄지므로 임의 HTML(스크립트, 이벤트 핸들러)이
// 저장될 수 있고, 상대방 화면에서 실행되면 stored XSS가 된다.
// sanitize-html은 jsdom 없이 동작해 서버 컴포넌트에서도 안전하게 쓸 수 있다.
export function sanitizeHtml(html: string): string {
	return sanitize(html, {
		allowedTags: [...sanitize.defaults.allowedTags, "img"],
		allowedAttributes: {
			...sanitize.defaults.allowedAttributes,
			img: ["src", "alt", "width", "height"],
		},
		allowedSchemes: ["http", "https", "mailto"],
	});
}
