import path from "path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

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
	headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
	brand: { fontSize: 14, fontWeight: "bold", color: "#2563EB" },
	title: { fontSize: 18, fontWeight: "bold", marginTop: 4, marginBottom: 4 },
	subtitle: { fontSize: 10, color: "#6B7280" },
	stampBox: {
		border: "2pt solid #16A34A",
		borderRadius: 6,
		paddingVertical: 6,
		paddingHorizontal: 14,
		transform: "rotate(-8deg)",
	},
	stampText: { fontSize: 14, fontWeight: "bold", color: "#16A34A" },
	sectionTitle: {
		fontSize: 12,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 16,
		borderBottom: "1pt solid #E5E7EB",
		paddingBottom: 4,
	},
	row: { flexDirection: "row", marginTop: 20, marginBottom: 4 },
	rowInline: { flexDirection: "row", marginBottom: 4 },
	label: { width: 120, color: "#9CA3AF" },
	value: { flex: 1, fontWeight: "bold" },
	companyRow: { flexDirection: "row", gap: 16 },
	companyBox: { flex: 1, border: "1pt solid #E5E7EB", borderRadius: 6, padding: 10 },
	companyName: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
	priceBox: {
		marginTop: 16,
		backgroundColor: "#F0FDF4",
		borderRadius: 6,
		padding: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	priceLabel: { fontSize: 10, color: "#16A34A" },
	priceValue: { fontSize: 20, fontWeight: "bold", color: "#16A34A" },
	notice: { marginTop: 24, fontSize: 8, color: "#9CA3AF", textAlign: "center" },
	footer: { marginTop: 4, fontSize: 8, color: "#9CA3AF", textAlign: "center" },
});

export type ReceiptPdfLabels = {
	brand: string;
	title: string;
	issuedLine: (date: string) => string;
	statusConfirmed: string;
	contractNumberLabel: string;
	transactionDateLabel: string;
	listingTitleLabel: string;
	paymentMethodLabel: string;
	paymentMethodValue: string;
	amountLabel: string;
	buyerSectionTitle: string;
	sellerSectionTitle: string;
	representativeLabel: string;
	addressLabel: string;
	bankNameLabel: string;
	notice: string;
	footer: string;
};

// 레퍼런스는 PG 카드 매출전표지만 우리는 PG를 쓰지 않는다. 카드번호·승인번호 같은
// 항목은 실제로 존재하지 않는 결제 기록이 되므로 절대 넣지 않는다 — 이 문서는
// "플랫폼상의 거래 확인증" 성격이다.
export type ReceiptPdfDocumentProps = {
	contractNumber: string;
	paymentConfirmedAt: string;
	listingTitle: string;
	price: number;
	currency: string;
	buyerCompany: { companyName: string; representative: string; address: string };
	sellerCompany: { companyName: string; representative: string; address: string; bankName: string };
	labels: ReceiptPdfLabels;
};

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function ReceiptPdfDocument({
	contractNumber,
	paymentConfirmedAt,
	listingTitle,
	price,
	currency,
	buyerCompany,
	sellerCompany,
	labels,
}: ReceiptPdfDocumentProps) {
	const symbol = CURRENCY_SYMBOL[currency] ?? currency;
	const date = formatDate(paymentConfirmedAt);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.headerRow}>
					<View>
						<Text style={styles.brand}>{labels.brand}</Text>
						<Text style={styles.title}>{labels.title}</Text>
						<Text style={styles.subtitle}>{labels.issuedLine(date)}</Text>
					</View>
					<View style={styles.stampBox}>
						<Text style={styles.stampText}>{labels.statusConfirmed}</Text>
					</View>
				</View>

				<View style={styles.row}>
					<Text style={styles.label}>{labels.contractNumberLabel}</Text>
					<Text style={styles.value}>{contractNumber}</Text>
				</View>
				<View style={styles.rowInline}>
					<Text style={styles.label}>{labels.transactionDateLabel}</Text>
					<Text style={styles.value}>{date}</Text>
				</View>
				<View style={styles.rowInline}>
					<Text style={styles.label}>{labels.listingTitleLabel}</Text>
					<Text style={styles.value}>{listingTitle}</Text>
				</View>
				<View style={styles.rowInline}>
					<Text style={styles.label}>{labels.paymentMethodLabel}</Text>
					<Text style={styles.value}>{labels.paymentMethodValue}</Text>
				</View>

				<View style={styles.priceBox}>
					<Text style={styles.priceLabel}>{labels.amountLabel}</Text>
					<Text style={styles.priceValue}>
						{symbol} {price.toLocaleString()}
					</Text>
				</View>

				<Text style={styles.sectionTitle}>{labels.buyerSectionTitle}</Text>
				<View style={styles.companyRow}>
					<View style={styles.companyBox}>
						<Text style={styles.companyName}>{buyerCompany.companyName || "-"}</Text>
						<Text>
							{labels.representativeLabel}: {buyerCompany.representative || "-"}
						</Text>
						<Text>
							{labels.addressLabel}: {buyerCompany.address || "-"}
						</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>{labels.sellerSectionTitle}</Text>
				<View style={styles.companyRow}>
					<View style={styles.companyBox}>
						<Text style={styles.companyName}>{sellerCompany.companyName || "-"}</Text>
						<Text>
							{labels.representativeLabel}: {sellerCompany.representative || "-"}
						</Text>
						<Text>
							{labels.addressLabel}: {sellerCompany.address || "-"}
						</Text>
						{sellerCompany.bankName && (
							<Text>
								{labels.bankNameLabel}: {sellerCompany.bankName}
							</Text>
						)}
					</View>
				</View>

				<Text style={styles.notice}>{labels.notice}</Text>
				<Text style={styles.footer}>{labels.footer}</Text>
			</Page>
		</Document>
	);
}
