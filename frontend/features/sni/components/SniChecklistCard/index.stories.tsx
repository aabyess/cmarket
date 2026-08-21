import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { SniChecklistCard } from "./index";
import messages from "@/messages/ko.json";

const meta: Meta<typeof SniChecklistCard> = {
	title: "sni/SniChecklistCard",
	component: SniChecklistCard,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof SniChecklistCard>;

export const Mandatory: Story = {
	args: { category: "machinery" },
};

export const Conditional: Story = {
	args: { category: "office" },
};

export const Unknown: Story = {
	args: { category: "other" },
};
