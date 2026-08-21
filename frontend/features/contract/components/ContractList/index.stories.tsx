// features/contract/components/ContractList/index.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { ContractListTable } from "@/features/contract/components/ContractList/ContractListTable";
import messages from "@/messages/ko.json";
import type { Contract } from "@/features/contract/types";
import type { MyReview } from "@/features/reviews/types";

const baseContract = {
	listingId: "listing-1",
	quoteId: "quote-1",
	buyerId: "buyer-1",
	sellerId: "seller-1",
	listing: { title: "사무용 의자 200개 구매" },
	quote: { price: 45000000, currency: "KRW", deliveryDays: 14 },
	partnerCompanyName: "대한정밀공업",
	createdAt: "2026-08-01T00:00:00Z",
};

const MOCK_CONTRACTS: Contract[] = [
	{
		...baseContract,
		id: "c1",
		status: "ongoing",
		paymentReceiptUrl: null,
		paymentConfirmedAt: null,
		deliveryConfirmedAt: null,
	},
	{
		...baseContract,
		id: "c2",
		status: "ongoing",
		paymentReceiptUrl: "receipts/c2.pdf",
		paymentConfirmedAt: null,
		deliveryConfirmedAt: null,
	},
	{
		...baseContract,
		id: "c3",
		status: "completed",
		paymentReceiptUrl: "receipts/c3.pdf",
		paymentConfirmedAt: "2026-08-05T00:00:00Z",
		deliveryConfirmedAt: null,
	},
	{
		...baseContract,
		id: "c4",
		status: "completed",
		paymentReceiptUrl: "receipts/c4.pdf",
		paymentConfirmedAt: "2026-08-05T00:00:00Z",
		deliveryConfirmedAt: "2026-08-10T00:00:00Z",
	},
	{
		...baseContract,
		id: "c5",
		status: "cancelled",
		paymentReceiptUrl: null,
		paymentConfirmedAt: null,
		deliveryConfirmedAt: null,
	},
];

const MOCK_REVIEW_MAP = new Map<string, MyReview>([
	["c4", { contractId: "c4", rating: 5, comment: "" }],
]);

const meta: Meta<typeof ContractListTable> = {
	title: "contract/ContractListTable",
	component: ContractListTable,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof ContractListTable>;

export const Buyer: Story = {
	args: {
		contracts: MOCK_CONTRACTS,
		role: "buyer",
		loadingId: null,
		uploadingId: null,
		myReviewMap: MOCK_REVIEW_MAP,
		onUploadClick: () => {},
		onViewReceipt: () => {},
		onRequestConfirm: () => {},
		onRequestCancel: () => {},
		onRequestDeliveryConfirm: () => {},
		onRequestReceiptDelete: () => {},
		onRequestReview: () => {},
		onOpenDetail: () => {},
	},
};

export const Seller: Story = {
	args: {
		...Buyer.args,
		role: "seller",
	},
};
