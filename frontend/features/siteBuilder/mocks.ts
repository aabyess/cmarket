import type { Block, SiteCompanyInfo } from "@/features/siteBuilder/types";

export const MOCK_COMPANY_INFO: SiteCompanyInfo = {
	companyName: "대한정밀공업",
	representative: "김대한",
	businessType: "제조업",
	businessItem: "정밀기계부품",
	businessNumber: "123-45-67890",
	address: "경기도 안산시 단원구 산단로 123",
};

export const MOCK_BLOCKS: Block[] = [
	{
		id: "block-hero",
		type: "HERO",
		props: {
			eyebrow: "정밀 가공 전문",
			title: "대한정밀공업",
			titleAccent: "정밀",
			subtitle: "30년 축적된 정밀 가공 기술로 산업기계 부품을 공급합니다",
			images: [],
			overlay: "medium",
			ctas: [{ label: "견적 문의하기", href: "#contact", emphasis: "primary" }],
			logoUrl: "",
			chips: ["산업기계", "연구장비", "수출 12개국"],
		},
	},
	{
		id: "block-text",
		type: "TEXT",
		props: {
			heading: "회사 소개",
			body: "대한정밀공업은 1994년 설립 이래 CNC 정밀 가공을 중심으로 산업기계 및 연구장비 부품을 생산해 왔습니다.\n2018년부터 인도네시아·베트남·태국의 제조 기업에 부품을 공급하고 있습니다.",
		},
	},
	{
		id: "block-products",
		type: "PRODUCTS",
		props: {
			heading: "주요 제품",
			items: [
				{
					id: "product-1",
					name: "정밀 베어링 하우징",
					description: "SUS304 · 오차 ±0.01mm",
					priceRange: "문의",
					imageUrls: [],
				},
				{
					id: "product-2",
					name: "CNC 가공 샤프트",
					description: "주문 제작 · 최소 50개",
					priceRange: "15만원~",
					imageUrls: [],
				},
			],
		},
	},
	{
		id: "block-certifications",
		type: "CERTIFICATIONS",
		props: { heading: "인증 및 수상", items: ["ISO 9001", "ISO 14001", "이노비즈 인증", "수출 500만불탑"] },
	},
	{
		id: "block-stats",
		type: "STATS",
		props: {
			heading: "한눈에 보기",
			items: [
				{ id: "stat-1", value: "1994", label: "설립" },
				{ id: "stat-2", value: "85명", label: "임직원" },
				{ id: "stat-3", value: "12개국", label: "수출" },
				{ id: "stat-4", value: "40만", label: "연간 생산(개)" },
			],
		},
	},
	{
		id: "block-gallery",
		type: "GALLERY",
		props: { heading: "생산 시설", imageUrls: [] },
	},
	{
		id: "block-contact",
		type: "CONTACT",
		props: {
			heading: "문의처",
			managerName: "김수출 / 해외영업팀 과장",
			email: "export@daehan-precision.kr",
			phone: "+82-31-123-4567",
			address: "경기도 안산시 단원구 산단로 123",
			website: "https://daehan-precision.kr",
		},
	},
	{
		id: "block-cta",
		type: "CTA",
		props: {
			heading: "필요한 부품이 있으신가요?",
			description: "견적 요청을 남기시면 영업일 기준 1일 내 회신드립니다.",
			buttonLabel: "견적 문의하기",
			buttonHref: "",
		},
	},
];
