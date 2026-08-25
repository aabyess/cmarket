import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
	DashboardTodoViewToggle,
	type DashboardTodoViewMode,
} from "@/features/shared/components/DashboardTodoViewToggle";

const meta: Meta<typeof DashboardTodoViewToggle> = {
	title: "Shared/DashboardTodoViewToggle",
	component: DashboardTodoViewToggle,
};

export default meta;
type Story = StoryObj<typeof DashboardTodoViewToggle>;

function DashboardTodoViewToggleDemo(): React.ReactNode {
	const [value, setValue] = useState<DashboardTodoViewMode>("list");
	return <DashboardTodoViewToggle value={value} onChange={setValue} />;
}

export const Default: Story = {
	render: () => <DashboardTodoViewToggleDemo />,
};
