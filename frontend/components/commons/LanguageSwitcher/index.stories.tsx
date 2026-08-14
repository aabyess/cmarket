// components/commons/LanguageSwitcher/index.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { LanguageSwitcher } from "@/components/commons/LanguageSwitcher";
import messages from "@/messages/ko.json";

const meta: Meta<typeof LanguageSwitcher> = {
	title: "Commons/LanguageSwitcher",
	component: LanguageSwitcher,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof LanguageSwitcher>;

export const Default: Story = {};
