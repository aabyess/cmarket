import type { Meta, StoryObj } from "@storybook/react";
import { DashboardHome } from "@/features/seller/components/DashboardHome";
import { MOCK_RECOMMENDED_LISTINGS, MOCK_SELLER_DASHBOARD_DATA } from "@/features/seller/mocks";

const meta: Meta<typeof DashboardHome> = {
	title: "seller/DashboardHome",
	component: DashboardHome,
};

export default meta;

type Story = StoryObj<typeof DashboardHome>;

export const HasRecommendations: Story = {
	args: {
		companyName: "대한축구협회",
		data: MOCK_SELLER_DASHBOARD_DATA,
		recommendedListings: MOCK_RECOMMENDED_LISTINGS,
	},
};

export const NoRecommendations: Story = {
	args: {
		companyName: "대한축구협회",
		data: MOCK_SELLER_DASHBOARD_DATA,
		recommendedListings: [],
	},
};

export const Empty: Story = {
	args: {
		companyName: "대한축구협회",
		data: {
			openListingCount: 0,
			quoteCount: 0,
			pendingQuoteCount: 0,
			awardedQuoteCount: 0,
			contractCount: 0,
			activities: [],
		},
		recommendedListings: [],
	},
};
