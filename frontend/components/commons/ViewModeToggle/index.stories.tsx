import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";

const meta: Meta<typeof ViewModeToggle> = {
	title: "Commons/ViewModeToggle",
	component: ViewModeToggle,
};

export default meta;
type Story = StoryObj<typeof ViewModeToggle>;

function ViewModeToggleDemo() {
	const [value, setValue] = useState<ViewMode>("grid");

	return <ViewModeToggle value={value} onChange={setValue} />;
}

export const Default: Story = {
	render: () => <ViewModeToggleDemo />,
};
