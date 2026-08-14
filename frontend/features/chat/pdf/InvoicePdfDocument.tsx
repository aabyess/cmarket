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
	priceLabel: { fontSize: 10, color: "#2563EB" },
	priceValue: { fontSize: 20, fontWeight: "bold", color: "#2563EB" },
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

export type InvoicePdfLabels = {
	title: string;
	issuedLine: (date: string) => string;
	invoiceNumberLabel: (number: string) => string;
	billToLabel: string;
	billFromLabel: string;
	representativeLabel: string;
	addressLabel: string;
	businessTypeItemLabel: string;
	itemsSectionTitle: string;
	itemNameColumn: string;
	itemSpecColumn: string;
	itemQtyColumn: string;
	paymentInfoSectionTitle: string;
	listingTitleLabel: string;
	deliveryDaysLabel: string;
	deliveryDaysValue: (days: number) => string;
	paymentMethodLabel: string;
	paymentMethodValue: string;
	amountDueLabel: string;
	paymentDueLabel: string;
	paymentDueValue: (date: string) => string;
	bankInfoTitle: string;
	bankNameLabel: string;
	accountNumberLabel: string;
	accountHolderLabel: string;
	swiftCodeLabel: string;
	receivingCurrencyLabel: string;
	footer: string;
};

type InvoicePdfDocumentProps = InvoicePdfData & {
	labels: InvoicePdfLabels;
};

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
	labels,
}: InvoicePdfDocumentProps) {
	const symbol = CURRENCY_SYMBOL[quote.currency] ?? quote.currency;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>{labels.title}</Text>
				<Text style={styles.subtitle}>{labels.issuedLine(formatDate(issuedAt))}</Text>
				<Text style={styles.invoiceNumber}>{labels.invoiceNumberLabel(invoiceNumber)}</Text>

				<View style={styles.companyRow}>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>{labels.billToLabel}</Text>
						<Text style={styles.companyName}>{buyerCompany.companyName || "-"}</Text>
						<Text>
							{labels.representativeLabel}: {buyerCompany.representative || "-"}
						</Text>
						<Text>
							{labels.addressLabel}: {buyerCompany.address || "-"}
						</Text>
					</View>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>{labels.billFromLabel}</Text>
						<Text style={styles.companyName}>{sellerCompany.companyName || "-"}</Text>
						<Text>
							{labels.businessTypeItemLabel}:{" "}
							{[sellerCompany.businessType, sellerCompany.businessItem].filter(Boolean).join(" / ") || "-"}
						</Text>
						<Text>
							{labels.representativeLabel}: {sellerCompany.representative || "-"}
						</Text>
						<Text>
							{labels.addressLabel}: {sellerCompany.address || "-"}
						</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>{labels.itemsSectionTitle}</Text>
				<View style={styles.table}>
					<View style={styles.tableHeader}>
						<Text style={styles.colName}>{labels.itemNameColumn}</Text>
						<Text style={styles.colSpec}>{labels.itemSpecColumn}</Text>
						<Text style={styles.colQty}>{labels.itemQtyColumn}</Text>
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

				<Text style={styles.sectionTitle}>{labels.paymentInfoSectionTitle}</Text>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.listingTitleLabel}</Text>
					<Text style={styles.value}>{listing.title}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.deliveryDaysLabel}</Text>
					<Text style={styles.value}>{labels.deliveryDaysValue(quote.deliveryDays)}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.paymentMethodLabel}</Text>
					<Text style={styles.value}>{labels.paymentMethodValue}</Text>
				</View>

				<View style={styles.priceBox}>
					<Text style={styles.priceLabel}>{labels.amountDueLabel}</Text>
					<Text style={styles.priceValue}>
						{symbol} {quote.price.toLocaleString()}
					</Text>
				</View>

				<View style={styles.dueDateBox}>
					<Text style={styles.dueDateLabel}>{labels.paymentDueLabel}</Text>
					<Text style={styles.dueDateValue}>{labels.paymentDueValue(formatDate(paymentDueDate))}</Text>
				</View>

				{bankAccount && (
					<View style={styles.bankBox}>
						<Text style={styles.bankTitle}>{labels.bankInfoTitle}</Text>
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>{labels.bankNameLabel}</Text>
							<Text style={styles.bankValue}>{bankAccount.bankName}</Text>
						</View>
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>{labels.accountNumberLabel}</Text>
							<Text style={styles.bankValue}>{bankAccount.accountNumber}</Text>
						</View>
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>{labels.accountHolderLabel}</Text>
							<Text style={styles.bankValue}>{bankAccount.accountHolder}</Text>
						</View>
						{bankAccount.swiftCode && (
							<View style={styles.bankRow}>
								<Text style={styles.bankLabel}>{labels.swiftCodeLabel}</Text>
								<Text style={styles.bankValue}>{bankAccount.swiftCode}</Text>
							</View>
						)}
						<View style={styles.bankRow}>
							<Text style={styles.bankLabel}>{labels.receivingCurrencyLabel}</Text>
							<Text style={styles.bankValue}>{bankAccount.currency}</Text>
						</View>
					</View>
				)}

				<Text style={styles.footer}>{labels.footer}</Text>
			</Page>
		</Document>
	);
}
