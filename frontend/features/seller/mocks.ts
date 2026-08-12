import type { OpenListing, SellerDashboardData } from "@/features/seller/types";

export const MOCK_SELLER_DASHBOARD_DATA: SellerDashboardData = {
	openListingCount: 15,
	quoteCount: 15,
	pendingQuoteCount: 9,
	awardedQuoteCount: 6,
	contractCount: 6,
	activities: [
		{ title: "PT. Mitra Teknologi 가 견적을 열람했어요", timeText: "2시간 전" },
		{ title: "사무용 복합기 견적요청이 마감됐어요", timeText: "어제" },
	],
};

export const MOCK_RECOMMENDED_LISTINGS: OpenListing[] = [
	{
		id: "listing-1",
		title: "실험실용 원심분리기 12대",
		description: "",
		items: [],
		currency: "KRW",
		totalBudget: 48000000,
		budgetInKrw: 48000000,
		budgetPublic: true,
		endDate: "2026-09-30",
		deliveryProvinsi: "Sumatera Barat",
		deliveryCity: "Kabupaten Solok",
		createdAt: "2026-08-01",
		hasMyQuote: false,
		status: "active",
	},
	{
		id: "listing-2",
		title: "사무용 복합기 30대 및 유지보수",
		description: "",
		items: [],
		currency: "KRW",
		totalBudget: 21000000,
		budgetInKrw: 21000000,
		budgetPublic: false,
		endDate: "2026-10-15",
		deliveryProvinsi: "Jawa Barat",
		deliveryCity: "Bandung",
		createdAt: "2026-08-05",
		hasMyQuote: false,
		status: "active",
	},
];
