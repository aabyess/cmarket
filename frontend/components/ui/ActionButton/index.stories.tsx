import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheckCircle2 } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";

const meta: Meta<typeof ActionButton> = {
	title: "UI/ActionButton",
	component: ActionButton,
	args: {
		children: "확인",
	},
};

export default meta;
type Story = StoryObj<typeof ActionButton>;

export const Primary: Story = {
	args: { tone: "primary" },
};

export const PrimaryBlue: Story = {
	args: { tone: "primaryBlue" },
};

export const Secondary: Story = {
	args: { tone: "secondary" },
};

export const SecondarySuccess: Story = {
	args: { tone: "secondarySuccess" },
};

export const SecondaryNeutral: Story = {
	args: { tone: "secondaryNeutral" },
};

export const Danger: Story = {
	args: { tone: "danger" },
};

export const DangerGhost: Story = {
	args: { tone: "dangerGhost" },
};

export const Disabled: Story = {
	args: { tone: "primary", disabled: true },
};

export const WithIcon: Story = {
	args: {
		tone: "primary",
		children: (
			<>
				<CheckCircle2 size={14} />
				확인
			</>
		),
	},
};

export const MediumSize: Story = {
	args: { tone: "primary", size: "md" },
};
