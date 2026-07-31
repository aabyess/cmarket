import type { Meta, StoryObj } from "@storybook/react";
import { DashboardHome } from "@/features/buyer/components/DashboardHome";
import { MOCK_DASHBOARD_DATA } from "@/features/buyer/mocks";

const meta: Meta<typeof DashboardHome> = {
	title: "buyer/DashboardHome",
	component: DashboardHome,
};

export default meta;

type Story = StoryObj<typeof DashboardHome>;

export const HasTodos: Story = {
	args: {
		companyName: "PT Maju Jaya",
		data: MOCK_DASHBOARD_DATA,
	},
};

export const Waiting: Story = {
	args: {
		companyName: "PT Maju Jaya",
		data: { ...MOCK_DASHBOARD_DATA, todos: [] },
	},
};

export const Empty: Story = {
	args: {
		companyName: "PT Maju Jaya",
		data: { ...MOCK_DASHBOARD_DATA, listingCount: 0, todos: [], activities: [] },
	},
};