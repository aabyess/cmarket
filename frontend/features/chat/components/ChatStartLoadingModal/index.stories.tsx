// features/chat/components/ChatStartLoadingModal/index.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { ChatStartLoadingModal } from "@/features/chat/components/ChatStartLoadingModal";
import messages from "@/messages/ko.json";

const meta: Meta<typeof ChatStartLoadingModal> = {
	title: "Chat/ChatStartLoadingModal",
	component: ChatStartLoadingModal,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof ChatStartLoadingModal>;

export const Preparing: Story = {
	args: { step: "preparing" },
};

export const Navigating: Story = {
	args: { step: "navigating" },
};
