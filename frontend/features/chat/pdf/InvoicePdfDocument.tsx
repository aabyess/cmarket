import path from "path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { InvoicePdfData } from "@/features/chat/pdf/getInvoicePdfData";

Font.register({
	family: "NotoSansKR",
	fonts: [
		{ src: path.join(process.cwd(), "public/fonts/NotoSansKR-Regular.ttf"), fontWeight: "normal" },
		{ src: path.join(process.cwd(), "public/fonts/NotoSansKR-Bold.ttf"), fontWeight: "bold" },
	],
});

const CURRENCY_SYMBOL: Record<string, string> = {
	USD: "$",
	IDR: "Rp",
	KRW: "₩",
};

const styles = StyleSheet.create({
	page: { fontFamily: "NotoSansKR", fontSize: 10, padding: 36, color: "#1F2937" },
	title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
	subtitle: { fontSize: 10, color: "#6B7280", marginBottom: 4 },
	invoiceNumber: { fontSize: 10, color: "#6B7280", marginBottom: 20 },
	sectionTitle: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 16,
		borderBottom: "1pt solid #E5E7EB",
		paddingBottom: 4,
	},
	row: { flexDirection: "row", marginBottom: 4 },
	label: { width: 120, color: "#9CA3AF" },
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
	bankBox: {
		marginTop: 16,
		border: "1pt solid #E5E7EB",
		borderRadius: 6,
		padding: 12,
	},
	bankTitle: { fontSize: 10, color: "#6B7280", marginBottom: 8 },
	bankRow: { flexDirection: "row", marginBottom: 4 },
	bankLabel: { width: 100, color: "#9CA3AF" },
	bankValue: { flex: 1, fontWeight: "bold" },
	priceBox: {
		marginTop: 16,
		backgroundColor: "#EFF6FF",
		borderRadius: 6,
		padding: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	priceLabel: { fontSize: 10, color: "#3B82F6" },
	priceValue: { fontSize: 20, fontWeight: "bold", color: "#3B82F6" },
	dueDateBox: {
		marginTop: 8,
		backgroundColor: "#FEF3C7",
		borderRadius: 6,
		padding: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dueDateLabel: { fontSize: 10, color: "#D97706" },
	dueDateValue: { fontSize: 10, fontWeight: "bold", color: "#D97706" },
	footer: { marginTop: 24, fontSize: 8, color: "#9CA3AF", textAlign: "center" },
});

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function InvoicePdfDocument({
	invoiceNumber,
	issuedAt,
	paymentDueDate,
	listing,
	quote,
	buyerCompany,
	sellerCompany,
	bankAccount,
}: InvoicePdfData) {
	const symbol = CURRENCY_SYMBOL[quote.currency] ?? quote.currency;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>인보이스 (Invoice)</Text>
				<Text style={styles.subtitle}>MitraPay · {formatDate(issuedAt)} 발행</Text>
				<Text style={styles.invoiceNumber}>인보이스 번호: {invoiceNumber}</Text>

				<View style={styles.companyRow}>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>청구 대상 (Bill To)</Text>
						<Text style={styles.companyName}>{buyerCompany.companyName || "-"}</Text>
						<Text>대표자: {buyerCompany.representative || "-"}</Text>
						<Text>주소: {buyerCompany.address || "-"}</Text>
					</View>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>공급기업 (Bill From)</Text>
						<Text style={styles.companyName}>{sellerCompany.companyName || "-"}</Text>
						<Text>
							업태/종목: {[sellerCompany.businessType, sellerCompany.businessItem].filter(Boolean).join(" / ") || "-"}
						</Text>
						<Text>대표자: {sellerCompany.representative || "-"}</Text>
						<Text>주소: {sellerCompany.address || "-"}</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>공급 품목</Text>
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

				<Text style={styles.sectionTitle}>결제 정보</Text>
				<View style={styles.row}>
					<Text style={styles.label}>공고명</Text>
					<Text style={styles.value}>{listing.title}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>납품 소요</Text>
					<Text style={styles.value}>{quote.deliveryDays}일</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>결제 방식</Text>
					<Text style={styles.value}>T/T 송금 (전신환)</Text>
				</View>

				<View style={styles.priceBox}>
					<Text style={styles.priceLabel}>청구 금액</Text>
					<Text style={styles.priceValue}>
						{symbol} {quote.price.toLocaleString()}
					</Text>
				</View>

				<View style={styles.dueDateBox}>
					<Text style={styles.dueDateLabel}>결제 기한</Text>
					<Text style={styles.dueDateValue}>{formatDate(paymentDueDate)} (발행일로부터 30일)</Text>
				</View>

				{bankAccount && (
					<View style={styles.bankBox}>
						<Text style={styles.bankTitle}>송금 계좌 정보 (Wire Transfer Details)</Text>
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>은행명</Text>
							<Text style={styles.bankValue}>{bankAccount.bankName}</Text>
						</View>
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>계좌번호</Text>
							<Text style={styles.bankValue}>{bankAccount.accountNumber}</Text>
						</View>
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>예금주</Text>
							<Text style={styles.bankValue}>{bankAccount.accountHolder}</Text>
						</View>
						{bankAccount.swiftCode && (
							<View style={styles.bankRow}>
								<Text style={styles.bankLabel}>SWIFT 코드</Text>
								<Text style={styles.bankValue}>{bankAccount.swiftCode}</Text>
							</View>
						)}
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>수취 통화</Text>
							<Text style={styles.bankValue}>{bankAccount.currency}</Text>
						</View>
					</View>
				)}

				<Text style={styles.footer}>
					본 인보이스는 MitraPay를 통해 자동 생성되었습니다. 문의: support@mitrapay.com
				</Text>
			</Page>
		</Document>
	);
}