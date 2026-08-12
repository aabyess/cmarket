import type { Meta, StoryObj } from "@storybook/react";
import { SiteRenderer } from "@/features/siteBuilder/components/SiteRenderer";
import { MOCK_BLOCKS } from "@/features/siteBuilder/mocks";

const meta: Meta<typeof SiteRenderer> = {
	title: "siteBuilder/SiteRenderer",
	component: SiteRenderer,
};

export default meta;

type Story = StoryObj<typeof SiteRenderer>;

export const AllBlocks: Story = {
	args: { blocks: MOCK_BLOCKS },
};

export const Minimal: Story = {
	args: { blocks: MOCK_BLOCKS.slice(0, 2) },
};

export const Empty: Story = {
	args: { blocks: [] },
};
