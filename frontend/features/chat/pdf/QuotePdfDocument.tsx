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
	disclaimer: {
		marginBottom: 16,
		backgroundColor: "#FFFBEB",
		border: "1pt solid #FDE68A",
		borderRadius: 6,
		padding: 10,
		fontSize: 9,
		color: "#92400E",
	},
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
		npwp: string;
		businessNumber: string;
	};
	sellerCompany: {
		companyName: string;
		representative: string;
		address: string;
		businessType: string;
		businessItem: string;
		npwp: string;
		businessNumber: string;
	};
};

export type QuotePdfLabels = {
	title: string;
	issuedLine: (date: string) => string;
	buyerCompanyLabel: string;
	sellerCompanyLabel: string;
	representativeLabel: string;
	addressLabel: string;
	businessTypeItemLabel: string;
	npwpLabel: string;
	businessNumberLabel: string;
	listingInfoSectionTitle: string;
	listingTitleLabel: string;
	categoryLabel: string;
	deadlineLabel: string;
	deliveryAddressLabel: string;
	itemsSectionTitle: string;
	itemNameColumn: string;
	itemSpecColumn: string;
	itemQtyColumn: string;
	quoteInfoSectionTitle: string;
	deliveryDaysLabel: string;
	deliveryDaysValue: (days: number) => string;
	noteLabel: string;
	priceLabel: string;
	footer: string;
	translationDisclaimer: string;
};

type QuotePdfDocumentProps = QuotePdfData & {
	labels: QuotePdfLabels;
	categoryLabels: Record<string, string>;
	/** 참고용 번역본일 때만 안내 문구를 넣는다. 원본에는 넣지 않는다. */
	isTranslationCopy?: boolean;
};

function formatDate(iso: string): string {
	const d = new Date(iso);
	return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function QuotePdfDocument({
	listing,
	quote,
	buyerCompany,
	sellerCompany,
	labels,
	categoryLabels,
	isTranslationCopy,
}: QuotePdfDocumentProps) {
	const symbol = CURRENCY_SYMBOL[quote.currency] ?? quote.currency;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<Text style={styles.title}>{labels.title}</Text>
				<Text style={styles.subtitle}>{labels.issuedLine(formatDate(quote.createdAt))}</Text>

				{isTranslationCopy && <Text style={styles.disclaimer}>{labels.translationDisclaimer}</Text>}

				<View style={styles.companyRow}>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>{labels.buyerCompanyLabel}</Text>
						<Text style={styles.companyName}>{buyerCompany.companyName || "-"}</Text>
						<Text>
							{labels.representativeLabel}: {buyerCompany.representative || "-"}
						</Text>
						{buyerCompany.npwp && (
							<Text>
								{labels.npwpLabel}: {buyerCompany.npwp}
							</Text>
						)}
						{buyerCompany.businessNumber && (
							<Text>
								{labels.businessNumberLabel}: {buyerCompany.businessNumber}
							</Text>
						)}
						<Text>
							{labels.addressLabel}: {buyerCompany.address || "-"}
						</Text>
					</View>
					<View style={styles.companyBox}>
						<Text style={styles.companyTitle}>{labels.sellerCompanyLabel}</Text>
						<Text style={styles.companyName}>{sellerCompany.companyName || "-"}</Text>
						<Text>
							{labels.businessTypeItemLabel}:{" "}
							{[sellerCompany.businessType, sellerCompany.businessItem].filter(Boolean).join(" / ") || "-"}
						</Text>
						<Text>
							{labels.representativeLabel}: {sellerCompany.representative || "-"}
						</Text>
						{sellerCompany.npwp && (
							<Text>
								{labels.npwpLabel}: {sellerCompany.npwp}
							</Text>
						)}
						{sellerCompany.businessNumber && (
							<Text>
								{labels.businessNumberLabel}: {sellerCompany.businessNumber}
							</Text>
						)}
						<Text>
							{labels.addressLabel}: {sellerCompany.address || "-"}
						</Text>
					</View>
				</View>

				<Text style={styles.sectionTitle}>{labels.listingInfoSectionTitle}</Text>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.listingTitleLabel}</Text>
					<Text style={styles.value}>{listing.title}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.categoryLabel}</Text>
					<Text style={styles.value}>{categoryLabels[listing.category] ?? listing.category}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.deadlineLabel}</Text>
					<Text style={styles.value}>{formatDate(listing.endDate)}</Text>
				</View>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.deliveryAddressLabel}</Text>
					<Text style={styles.value}>
						{[listing.deliveryProvinsi, listing.deliveryCity, listing.deliveryAddress]
							.filter(Boolean)
							.join(" ")}
					</Text>
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

				<Text style={styles.sectionTitle}>{labels.quoteInfoSectionTitle}</Text>
				<View style={styles.row}>
					<Text style={styles.label}>{labels.deliveryDaysLabel}</Text>
					<Text style={styles.value}>{labels.deliveryDaysValue(quote.deliveryDays)}</Text>
				</View>
				{quote.note && (
					<View style={styles.row}>
						<Text style={styles.label}>{labels.noteLabel}</Text>
						<Text style={styles.value}>{quote.note}</Text>
					</View>
				)}

				<View style={styles.priceBox}>
					<Text style={styles.priceLabel}>{labels.priceLabel}</Text>
					<Text style={styles.priceValue}>
						{symbol} {quote.price.toLocaleString()}
					</Text>
				</View>

				<Text style={styles.footer}>{labels.footer}</Text>
			</Page>
		</Document>
	);
}
