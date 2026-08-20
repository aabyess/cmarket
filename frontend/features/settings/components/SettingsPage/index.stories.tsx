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
	},
};

export const Seller: Story = {
	args: {
		role: "seller",
		email: "seller@example.com",
	},
};
