import { Award, BarChart3, Building2, FileText, ImageIcon, Mail, Megaphone, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BlockType, HeroCtaEmphasis, HeroOverlay } from "@/features/siteBuilder/types";

export const BLOCK_TYPE_OPTIONS: BlockType[] = [
	"HERO",
	"TEXT",
	"PRODUCTS",
	"CERTIFICATIONS",
	"CONTACT",
	"GALLERY",
	"STATS",
	"CTA",
];

export const BLOCK_LABELS: Record<BlockType, string> = {
	HERO: "대표 배너",
	TEXT: "본문",
	PRODUCTS: "제품 목록",
	CERTIFICATIONS: "인증 · 수상",
	CONTACT: "문의처",
	GALLERY: "이미지 갤러리",
	STATS: "숫자 강조",
	CTA: "문의 유도",
};

export const BLOCK_DESCRIPTIONS: Record<BlockType, string> = {
	HERO: "맨 위 배너 — 로고, 회사명, 한 줄 소개",
	TEXT: "자유 본문 — 회사 소개, 연혁, 생산 역량",
	PRODUCTS: "제품 카드 — 이미지, 설명, 가격대",
	CERTIFICATIONS: "인증 · 수상 이력 배지",
	CONTACT: "담당자, 이메일, 전화, 주소",
	GALLERY: "공장 전경, 생산 라인 등 자유 이미지",
	STATS: "설립연도, 직원수 등 숫자 강조",
	CTA: "견적 문의 유도 버튼",
};

export const BLOCK_ICONS: Record<BlockType, LucideIcon> = {
	HERO: Building2,
	TEXT: FileText,
	PRODUCTS: Package,
	CERTIFICATIONS: Award,
	CONTACT: Mail,
	GALLERY: ImageIcon,
	STATS: BarChart3,
	CTA: Megaphone,
};

export const CURRENCY_OPTIONS: string[] = ["KRW", "USD", "IDR"];

export const HERO_OVERLAY_OPTIONS: { value: HeroOverlay; label: string }[] = [
	{ value: "none", label: "없음" },
	{ value: "light", label: "약하게" },
	{ value: "medium", label: "보통" },
	{ value: "dark", label: "진하게" },
];

export const HERO_CTA_EMPHASIS_OPTIONS: { value: HeroCtaEmphasis; label: string }[] = [
	{ value: "primary", label: "강조" },
	{ value: "secondary", label: "보조" },
];

export const SITE_PAGE_SLUG = "";
export const SITE_PAGE_LOCALE = "ko";
