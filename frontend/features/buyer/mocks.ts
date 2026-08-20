import type { BuyerDashboardData } from "@/features/buyer/types";

export const MOCK_DASHBOARD_DATA: BuyerDashboardData = {
	listingCount: 5,
	todos: [
		{
			id: "todo-1",
			listingId: "LT002",
			title: "진동 측정기에 견적 12건이 도착했어요",
			description: "최저가 ₩42,000,000 · 가장 빠른 납기 5일",
			deadlineText: "마감까지 2일",
			actionLabel: "견적 비교하고 선택하기",
			highlights: [
				{ label: "최저가", value: "대한사무기기" },
				{ label: "최속납기", value: "코리아프린팅" },
			],
		},
		{
			id: "todo-2",
			listingId: "LT001",
			title: "사무용품 500개 묶음",
			description: "견적 8건 · 최저가 ₩12,400,000",
			deadlineText: "마감 D-5",
			actionLabel: "견적 비교하고 선택하기",
			highlights: [
				{ label: "최저가", value: "서울문구" },
				{ label: "최속납기", value: "한국오피스" },
			],
		},
		{
			id: "todo-3",
			listingId: "LT003",
			title: "케미컬 용제",
			description: "공급기업이 서류를 올렸어요",
			deadlineText: null,
			actionLabel: "서류 확인하기",
			highlights: [],
		},
	],
	savings: {
		totalAmount: 248000000,
		completedCount: 33,
	},
	badges: { quotes: 5, chats: 1 },
	activities: [
		{
			id: "act-1",
			type: "quote",
			quoteId: "quote-1",
			title: "진동 측정기 · 새 견적 도착",
			description: "₩42,000,000 · 대한사무기기",
			timeText: "방금",
		},
		{
			id: "act-2",
			type: "document",
			quoteId: "quote-2",
			title: "케미컬 용제 · 서류 업로드됨",
			description: "공급기업이 선적 서류를 올렸어요",
			timeText: "어제",
		},
		{
			id: "act-3",
			type: "completed",
			quoteId: "quote-3",
			title: "기계 부품 · 거래 완료",
			description: "Rp 12.000.000 절감",
			timeText: "7.28",
		},
	],
};