import path from "path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

Font.register({
	family: "NotoSansKR",
	fonts: [
		{ src: path.join(process.cwd(), "public/fonts/NotoSansKR-Regular.ttf"), fontWeight: "normal" },
		{ src: path.join(process.cwd(), "public/fonts/NotoSansKR-Bold.ttf"), fontWeight: "bold" },
	],
});

const CATEGORY_LABEL: Record<string, string> = {
	office: "사무용품",
	lab: "연구장비",
	machinery: "산업기계",
	chemical: "화학약품",
};

const CURRENCY_SYMBOL: Record<string, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const styles = StyleSheet.create({
	page: { fontFamily: "NotoSansKR", fontSize: 10, padding: 36, color: "#1F2937" },
	title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
	subtitle: { fontSize: 10, color: "#6B7280", marginBottom: 20 },
	sectionTitle: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 16,
		borderBottom: "1pt solid #E5E7EB",
		paddingBottom: 4,
	},
	row: { flexDirection: "row", marginBottom: 4 },
	label: { width: 100, color: "#9CA3AF" },
	value: { flex: 1, fontWeight: "bold" },
	companyRow: { flexDirection: "row", gap: 16 },
	companyBox: { flex: 1, border: "1pt solid #E5E7EB", borderRadius: 6, padding: 10 },
	companyTitle: { fontSize: 10, color: "#6B7280", marginBottom: 6 },
	companyName: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
	table: { marginTop: 4 },
	tableHeader: {
		flexDirection: "row",
		backgroundColor: "#F9FAFB",
		paddingVertical: 6,
		paddingHorizontal: 8,
		fontWeight: "bold",
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderBottom: "1pt solid #F3F4F6",
	},
	colName: { flex: 2 },
	colSpec: { flex: 2 },
	colQty: { flex: 1, textAlign: "right" },
	priceBox: {
		marginTop: 16,
		backgroundColor: "#EFF6FF",
		borderRadius: 6,
		padding: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	priceLabel: { fontSize: 10, color: "#2563EB" },
	priceValue: { fontSize: 20, fontWeight: "bold", color: "#2563EB" },
	footer: { marginTop: 24, fontSize: 8, color: "#9CA3AF", textAlign: "center" },
});

export type QuotePdfData = {
	listing: {
		title: string;
		category: string;
		items: { name: string; spec: string; quantity: number; unit: string }[];
		currency: string;
		totalBudget: number;
		budgetPublic: boolean;
		endDate: string;
		deliveryProvinsi: string;
		deliveryCity: string;
		deliveryAddress: string;
	};
	quote: {
		price: number;
		currency: string;
		deliveryDays: number;
		note: string;
		createdAt: string;
	};
	buyerCompany: {
		companyName: string;
		representative: string;
		address: string;
	};
	sellerCompany: {
		companyName: string;
		representative: string;
		address: string;
		businessType: string;
		businessItem: string;
	};
};

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function QuotePdfDocument({ listing, quote, buyerCompany, sellerCompany }: QuotePdfData) {
	const symbol = CURRENCY_SYMBOL[quote.currency] ?? quote.currency;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>견적서</Text>
				<Text style={styles.subtitle}>MitraPay · {formatDate(quote.createdAt)} 발행</Text>

				<View style={styles.companyRow}>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>발주기업 (Buyer)</Text>
						<Text style={styles.companyName}>{buyerCompany.companyName || "-"}</Text>
						<Text>대표자: {buyerCompany.representative || "-"}</Text>
						<Text>주소: {buyerCompany.address || "-"}</Text>
					</View>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>공급기업 (Seller)</Text>
						<Text style={styles.companyName}>{sellerCompany.companyName || "-"}</Text>
						<Text>
							업태/종목: {[sellerCompany.businessType, sellerCompany.businessItem].filter(Boolean).join(" / ") || "-"}
						</Text>
						<Text>대표자: {sellerCompany.representative || "-"}</Text>
						<Text>주소: {sellerCompany.address || "-"}</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>공고 정보</Text>
				<View style={styles.row}>
					<Text style={styles.label}>공고명</Text>
					<Text style={styles.value}>{listing.title}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>카테고리</Text>
					<Text style={styles.value}>{CATEGORY_LABEL[listing.category] ?? listing.category}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>마감일</Text>
					<Text style={styles.value}>{formatDate(listing.endDate)}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>배송지</Text>
					<Text style={styles.value}>
						{[listing.deliveryProvinsi, listing.deliveryCity, listing.deliveryAddress]
							.filter(Boolean)
							.join(" ")}
					</Text>
				</View>

				<Text style={styles.sectionTitle}>품목 내역</Text>
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<Text style={styles.colName}>품목명</Text>
						<Text style={styles.colSpec}>규격</Text>
						<Text style={styles.colQty}>수량</Text>
					</View>
					{listing.items.map((item, i) => (
						<View key={i} style={styles.tableRow}>
							<Text style={styles.colName}>{item.name}</Text>
							<Text style={styles.colSpec}>{item.spec || "-"}</Text>
							<Text style={styles.colQty}>
								{item.quantity} {item.unit}
							</Text>
						</View>
					))}
				</View>

				<Text style={styles.sectionTitle}>견적 정보</Text>
				<View style={styles.row}>
					<Text style={styles.label}>납품 소요</Text>
					<Text style={styles.value}>{quote.deliveryDays}일</Text>
				</View>
				{quote.note && (
					<View style={styles.row}>
						<Text style={styles.label}>제안 메모</Text>
						<Text style={styles.value}>{quote.note}</Text>
					</View>
				)}

				<View style={styles.priceBox}>
					<Text style={styles.priceLabel}>견적가</Text>
					<Text style={styles.priceValue}>
						{symbol} {quote.price.toLocaleString()}
					</Text>
				</View>

				<Text style={styles.footer}>본 견적서는 MitraPay를 통해 자동 생성되었습니다.</Text>
			</Page>
		</Document>
	);
}