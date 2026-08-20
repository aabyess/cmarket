import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LegalPageLayout } from "./index";

const meta: Meta<typeof LegalPageLayout> = {
	title: "legal/LegalPageLayout",
	component: LegalPageLayout,
};

export default meta;
type Story = StoryObj<typeof LegalPageLayout>;

export const Default: Story = {
	args: {
		title: "이용약관",
		children: <p>문서 본문이 여기에 표시됩니다.</p>,
	},
};
