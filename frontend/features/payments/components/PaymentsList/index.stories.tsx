import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { PaymentsList } from "./index";
import { MOCK_CONTRACTS } from "@/features/payments/mocks";
import messages from "@/messages/ko.json";

const meta: Meta<typeof PaymentsList> = {
	title: "payments/PaymentsList",
	component: PaymentsList,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof PaymentsList>;

export const BuyerView: Story = {
	args: {
		contracts: MOCK_CONTRACTS,
		role: "buyer",
	},
};

export const SellerView: Story = {
	args: {
		contracts: MOCK_CONTRACTS,
		role: "seller",
	},
};

export const Empty: Story = {
	args: {
		contracts: [],
		role: "buyer",
	},
};
