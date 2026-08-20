import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PrivacyContent } from "./index";

const meta: Meta<typeof PrivacyContent> = {
	title: "legal/PrivacyContent",
	component: PrivacyContent,
};

export default meta;
type Story = StoryObj<typeof PrivacyContent>;

export const Default: Story = {};
