import type { ListingCategory } from "@/features/buyer/types";
import type { SniChecklistEntry } from "@/features/sni/types";

// 리서치 데이터(2026-08-21). sourceUrl은 조사 출처 기록용(UI 미노출 — 2차 출처라
// 화면에는 공식 목록 링크만 보여준다), 확인일(lastCheckedDate)은 카드에 항상 노출한다.
export const SNI_CHECKLIST_DATA: Record<ListingCategory, SniChecklistEntry> = {
	office: {
		category: "office",
		sniRequired: "conditional",
		itemSniRequired: [false, true],
		sourceUrl: "https://businesshubasia.com/sni-certification-indonesia-2026/",
		lastCheckedDate: "2026-08-21",
	},
	lab: {
		category: "lab",
		sniRequired: "conditional",
		itemSniRequired: [true, false],
		sourceUrl: "https://businesshubasia.com/sni-certification-indonesia-2026/",
		lastCheckedDate: "2026-08-21",
	},
	machinery: {
		category: "machinery",
		sniRequired: "yes",
		itemSniRequired: [true, false],
		sourceUrl: "https://businesshubasia.com/sni-certification-indonesia-2026/",
		lastCheckedDate: "2026-08-21",
	},
	chemical: {
		category: "chemical",
		sniRequired: "yes",
		itemSniRequired: [true, true],
		sourceUrl:
			"https://insights.tuv.com/blog/strengthening-the-protection-of-consumers-the-indonesian-ministry-of-trade-introduces-the-k3l-security-safety-health-and-environment-regulation",
		lastCheckedDate: "2026-08-21",
	},
	other: {
		category: "other",
		sniRequired: "unknown",
		itemSniRequired: [],
		sourceUrl: "http://pustan.kemenperin.go.id/List_SNI_Wajib",
		lastCheckedDate: "2026-08-21",
	},
};
