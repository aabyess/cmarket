import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { SniChecklistSection } from "./index";
import messages from "@/messages/ko.json";

const meta: Meta<typeof SniChecklistSection> = {
	title: "sni/SniChecklistSection",
	component: SniChecklistSection,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof SniChecklistSection>;

export const Default: Story = {
	args: { category: "chemical" },
};
