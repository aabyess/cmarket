// features/settings/components/SettingsPage/index.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { SettingsPage } from "@/features/settings/components/SettingsPage";
import messages from "@/messages/ko.json";

const meta: Meta<typeof SettingsPage> = {
	title: "settings/SettingsPage",
	component: SettingsPage,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;

type Story = StoryObj<typeof SettingsPage>;

export const Buyer: Story = {
	args: {
		role: "buyer",
		email: "buyer@example.com",
		bankAccount: null,
	},
};

export const Seller: Story = {
	args: {
		role: "seller",
		email: "seller@example.com",
		bankAccount: {
			bankName: "",
			accountNumber: "",
			accountHolder: "",
			swiftCode: "",
			currency: "KRW",
		},
	},
};

export const SellerWithBankAccount: Story = {
	args: {
		role: "seller",
		email: "seller@example.com",
		bankAccount: {
			bankName: "국민은행",
			accountNumber: "123-456-789012",
			accountHolder: "대한정밀공업",
			swiftCode: "CZNBKRSE",
			currency: "KRW",
		},
	},
};
