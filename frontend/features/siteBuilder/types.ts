import type { VerificationStatus } from "@/features/verification/types";

export type BlockType =
	| "HERO"
	| "TEXT"
	| "PRODUCTS"
	| "CERTIFICATIONS"
	| "CONTACT"
	| "GALLERY"
	| "STATS"
	| "CTA";

export type HeroOverlay = "none" | "light" | "medium" | "dark";

export type HeroCtaEmphasis = "primary" | "secondary";

export type HeroCta = {
	label: string;
	href: string;
	emphasis: HeroCtaEmphasis;
};

// 필드 구성은 기존 플랫폼(demo.page_revision 의 HERO)을 따른다.
// logoUrl · chips 는 MitraPay 확장이다 — 상대 렌더러는 모르는 키를 무시한다.
export type HeroProps = {
	eyebrow: string;
	title: string;
	titleAccent: string;
	subtitle: string;
	images: string[];
	overlay: HeroOverlay;
	ctas: HeroCta[];
	logoUrl: string;
	chips: string[];
};

export type TextProps = {
	heading: string;
	body: string;
};

export type ProductItem = {
	id: string;
	name: string;
	description: string;
	priceRange: string;
	imageUrls: string[];
};

export type ProductsProps = {
	heading: string;
	items: ProductItem[];
};

export type CertificationsProps = {
	heading: string;
	items: string[];
};

export type ContactProps = {
	heading: string;
	managerName: string;
	email: string;
	phone: string;
	address: string;
	website: string;
};

export type GalleryProps = {
	heading: string;
	imageUrls: string[];
};

export type StatItem = {
	id: string;
	value: string;
	label: string;
};

export type StatsProps = {
	heading: string;
	items: StatItem[];
};

export type CtaProps = {
	heading: string;
	description: string;
	buttonLabel: string;
	buttonHref: string;
};

export type Block =
	| { id: string; type: "HERO"; props: HeroProps }
	| { id: string; type: "TEXT"; props: TextProps }
	| { id: string; type: "PRODUCTS"; props: ProductsProps }
	| { id: string; type: "CERTIFICATIONS"; props: CertificationsProps }
	| { id: string; type: "CONTACT"; props: ContactProps }
	| { id: string; type: "GALLERY"; props: GalleryProps }
	| { id: string; type: "STATS"; props: StatsProps }
	| { id: string; type: "CTA"; props: CtaProps };

export type BlockPropsOf<T extends BlockType> = Extract<Block, { type: T }>["props"];

export type SiteRole = "buyer" | "seller";

export type SitePageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type SiteEditorData = {
	tenantId: string;
	profileId: string;
	pageId: string;
	status: SitePageStatus;
	blocks: Block[];
	// 기존 기업 프로필 데이터로 초안을 자동 구성한 경우 true — 아직 저장되지 않은 상태다.
	isSeeded: boolean;
	hasPublished: boolean;
	hasUnpublishedChanges: boolean;
	settings: SiteTradeSettings;
};

export type SiteTradeSettings = {
	logoUrl: string;
	categories: string[];
	bankAccount: SiteBankAccount;
	company: SiteCompanyInfo;
	contact: SiteContactInfo;
};

// 사업자등록번호는 인보이스·계약서에 찍히는 식별자라 편집 대상이 아니다.
export type SiteContactInfo = {
	name: string;
	title: string;
	department: string;
	email: string;
	phone: string;
	mobile: string;
};

export type SiteBankAccount = {
	bankName: string;
	accountNumber: string;
	accountHolder: string;
	swiftCode: string;
	currency: string;
};

export type SiteCompanyInfo = {
	companyName: string;
	representative: string;
	businessType: string;
	businessItem: string;
	businessNumber: string;
	address: string;
};

export type PublicSite = {
	company: SiteCompanyInfo;
	verificationStatus: VerificationStatus;
	logoUrl: string;
	blocks: Block[];
	isPublished: boolean;
};
