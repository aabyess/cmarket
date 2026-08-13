import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PublicSiteView } from "@/features/siteBuilder/components/PublicSite";
import { MOCK_BLOCKS, MOCK_COMPANY_INFO } from "@/features/siteBuilder/mocks";

const meta: Meta<typeof PublicSiteView> = {
	title: "siteBuilder/PublicSite",
	component: PublicSiteView,
};

export default meta;

type Story = StoryObj<typeof PublicSiteView>;

export const Published: Story = {
	args: {
		site: { company: MOCK_COMPANY_INFO, logoUrl: "", blocks: MOCK_BLOCKS, isPublished: true },
		backHref: "/buyer/quote-review",
		backLabel: "받은 견적으로",
	},
};

export const NotPublished: Story = {
	args: {
		site: { company: MOCK_COMPANY_INFO, logoUrl: "", blocks: [], isPublished: false },
		backHref: "/buyer/quote-review",
		backLabel: "받은 견적으로",
	},
};
