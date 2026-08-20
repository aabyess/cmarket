import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TermsContent } from "./index";

const meta: Meta<typeof TermsContent> = {
	title: "legal/TermsContent",
	component: TermsContent,
};

export default meta;
type Story = StoryObj<typeof TermsContent>;

export const Default: Story = {};
