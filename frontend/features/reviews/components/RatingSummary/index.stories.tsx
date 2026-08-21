import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RatingSummary } from "./index";

const meta: Meta<typeof RatingSummary> = {
	title: "reviews/RatingSummary",
	component: RatingSummary,
};

export default meta;
type Story = StoryObj<typeof RatingSummary>;

export const WithReviews: Story = {
	args: {
		average: 4.5,
		count: 12,
	},
};

export const SingleReview: Story = {
	args: {
		average: 5,
		count: 1,
	},
};

export const Empty: Story = {
	args: {
		average: null,
		count: 0,
	},
};
