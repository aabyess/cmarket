import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PageLoading } from "@/components/commons/PageLoading";

const meta: Meta<typeof PageLoading> = {
	title: "Commons/PageLoading",
	component: PageLoading,
};

export default meta;
type Story = StoryObj<typeof PageLoading>;

export const Default: Story = {};
