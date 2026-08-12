import { CATEGORY_LABELS } from "@/features/buyer/constants";
import type { ListingCategory } from "@/features/buyer/types";
import type { Block } from "@/features/siteBuilder/types";

export type LegacyProfile = {
	companyName: string;
	representative: string;
	businessType: string;
	businessItem: string;
	address: string;
	logoUrl: string;
	description: string;
	establishedYear: number | null;
	employeeCount: string;
	certifications: string[];
	categories: string[];
	websiteUrl: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;
	products: LegacyProduct[];
};

export type LegacyProduct = {
	id: string;
	name: string;
	description: string;
	priceRange: string;
	imageUrls: string[];
};

function toCategoryLabel(category: string): string {
	return CATEGORY_LABELS[category as ListingCategory] ?? category;
}

/**
 * 기존 기업 프로필(company_profiles · products · contacts)로 첫 초안을 만든다.
 * 블록 id 는 고정값이다 — 저장 전에는 새로고침해도 같은 초안이 나와야 하기 때문이다.
 */
export function buildSeedBlocks(profile: LegacyProfile): Block[] {
	const blocks: Block[] = [
		{
			id: "seed-hero",
			type: "HERO",
			props: {
				eyebrow: "",
				title: profile.companyName,
				titleAccent: "",
				subtitle: [profile.businessType, profile.businessItem].filter(Boolean).join(" · "),
				images: [],
				overlay: "medium",
				ctas: [],
				logoUrl: profile.logoUrl,
				chips: profile.categories.map(toCategoryLabel),
			},
		},
	];

	if (profile.description) {
		blocks.push({
			id: "seed-text",
			type: "TEXT",
			props: { heading: "회사 소개", body: profile.description },
		});
	}

	if (profile.products.length > 0) {
		blocks.push({
			id: "seed-products",
			type: "PRODUCTS",
			props: { heading: "주요 제품", items: profile.products },
		});
	}

	if (profile.certifications.length > 0) {
		blocks.push({
			id: "seed-certifications",
			type: "CERTIFICATIONS",
			props: { heading: "인증 및 수상", items: profile.certifications },
		});
	}

	const stats = [
		{ id: "seed-stat-year", value: profile.establishedYear?.toString() ?? "", label: "설립" },
		{ id: "seed-stat-employee", value: profile.employeeCount, label: "임직원" },
	].filter((stat) => stat.value);

	if (stats.length > 0) {
		blocks.push({ id: "seed-stats", type: "STATS", props: { heading: "한눈에 보기", items: stats } });
	}

	const hasContact =
		profile.contactName ||
		profile.contactEmail ||
		profile.contactPhone ||
		profile.address ||
		profile.websiteUrl;

	if (hasContact) {
		blocks.push({
			id: "seed-contact",
			type: "CONTACT",
			props: {
				heading: "문의처",
				managerName: profile.contactName || profile.representative,
				email: profile.contactEmail,
				phone: profile.contactPhone,
				address: profile.address,
				website: profile.websiteUrl,
			},
		});
	}

	return blocks;
}
