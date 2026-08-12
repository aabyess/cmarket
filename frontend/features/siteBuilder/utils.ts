import type { Block, BlockType } from "@/features/siteBuilder/types";

export function createId(): string {
	return crypto.randomUUID();
}

export function createBlock(type: BlockType): Block {
	const id = createId();

	switch (type) {
		case "HERO":
			return {
				id,
				type,
				props: {
					eyebrow: "",
					title: "",
					titleAccent: "",
					subtitle: "",
					images: [],
					overlay: "medium",
					ctas: [],
					logoUrl: "",
					chips: [],
				},
			};
		case "TEXT":
			return { id, type, props: { heading: "회사 소개", body: "" } };
		case "PRODUCTS":
			return { id, type, props: { heading: "주요 제품", items: [] } };
		case "CERTIFICATIONS":
			return { id, type, props: { heading: "인증 및 수상", items: [] } };
		case "CONTACT":
			return {
				id,
				type,
				props: { heading: "문의처", managerName: "", email: "", phone: "", address: "", website: "" },
			};
		case "GALLERY":
			return { id, type, props: { heading: "생산 시설", imageUrls: [] } };
		case "STATS":
			return { id, type, props: { heading: "한눈에 보기", items: [] } };
		case "CTA":
			return {
				id,
				type,
				props: {
					heading: "필요한 제품이 있으신가요?",
					description: "견적 요청을 남겨 주시면 빠르게 회신드립니다.",
					buttonLabel: "견적 문의하기",
					buttonHref: "",
				},
			};
	}
}

export function moveBlock(blocks: Block[], index: number, direction: -1 | 1): Block[] {
	const target = index + direction;
	if (target < 0 || target >= blocks.length) return blocks;

	const next = [...blocks];
	[next[index], next[target]] = [next[target], next[index]];
	return next;
}

export function isBlockArray(value: unknown): value is Block[] {
	if (!Array.isArray(value)) return false;

	return value.every((item) => {
		if (typeof item !== "object" || item === null) return false;
		const record = item as Record<string, unknown>;
		return typeof record.id === "string" && typeof record.type === "string" && typeof record.props === "object";
	});
}

/**
 * jsonb 로 저장된 블록은 스키마가 바뀌기 전에 쌓인 것일 수 있다.
 * 배열·열거 필드가 비어 있으면 렌더링이 터지므로 읽는 시점에 채운다.
 */
export function normalizeBlocks(blocks: Block[]): Block[] {
	return blocks.map((block) => {
		if (block.type !== "HERO") return block;

		return {
			...block,
			props: {
				eyebrow: block.props.eyebrow ?? "",
				title: block.props.title ?? "",
				titleAccent: block.props.titleAccent ?? "",
				subtitle: block.props.subtitle ?? "",
				images: block.props.images ?? [],
				overlay: block.props.overlay ?? "medium",
				ctas: block.props.ctas ?? [],
				logoUrl: block.props.logoUrl ?? "",
				chips: block.props.chips ?? [],
			},
		};
	});
}
