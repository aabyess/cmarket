import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { ReviewModal } from "./index";
import messages from "@/messages/ko.json";

const meta: Meta<typeof ReviewModal> = {
	title: "reviews/ReviewModal",
	component: ReviewModal,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof ReviewModal>;

export const Default: Story = {
	args: {
		isOpen: true,
		onSubmit: () => {},
		onClose: () => {},
	},
};

export const Submitting: Story = {
	args: {
		isOpen: true,
		isLoading: true,
		onSubmit: () => {},
		onClose: () => {},
	},
};
