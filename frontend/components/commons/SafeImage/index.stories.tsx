// components/commons/SafeImage/index.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SafeImage } from "@/components/commons/SafeImage";

const meta: Meta<typeof SafeImage> = {
	title: "Commons/SafeImage",
	component: SafeImage,
};

export default meta;
type Story = StoryObj<typeof SafeImage>;

export const AllowedHost: Story = {
	args: {
		src: "https://flagcdn.com/w80/kr.png",
		alt: "허용된 호스트",
		width: 64,
		height: 64,
	},
};

export const DisallowedHost: Story = {
	args: {
		src: "https://example.com/logo.png",
		alt: "허용되지 않은 호스트 — 일반 img로 우회",
		width: 64,
		height: 64,
	},
};
