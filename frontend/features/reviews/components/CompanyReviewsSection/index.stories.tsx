import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { CompanyReviewsSection } from "./index";
import messages from "@/messages/ko.json";
import type { CompanyReview } from "@/features/reviews/serverApis";

const MOCK_REVIEWS: CompanyReview[] = [
	{
		id: "1",
		rating: 5,
		comment: "납기도 정확하고 소통도 원활했습니다. 다음에도 함께하고 싶어요.",
		reviewerCompanyName: "(주)한국무역",
		createdAt: "2026-08-10T00:00:00.000Z",
	},
	{
		id: "2",
		rating: 4,
		comment: "품질은 만족스러웠으나 응답이 조금 늦었습니다.",
		reviewerCompanyName: "글로벌파츠",
		createdAt: "2026-08-01T00:00:00.000Z",
	},
	{
		id: "3",
		rating: 3,
		comment: "",
		reviewerCompanyName: "테스트기업",
		createdAt: "2026-07-20T00:00:00.000Z",
	},
];

const meta: Meta<typeof CompanyReviewsSection> = {
	title: "reviews/CompanyReviewsSection",
	component: CompanyReviewsSection,
	decorators: [
		(Story) => (
			<NextIntlClientProvider locale="ko" messages={messages}>
				<Story />
			</NextIntlClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof CompanyReviewsSection>;

export const WithReviews: Story = {
	args: {
		reviews: MOCK_REVIEWS,
		totalCount: MOCK_REVIEWS.length,
		averageRating: 4,
	},
};

export const Empty: Story = {
	args: {
		reviews: [],
		totalCount: 0,
		averageRating: null,
	},
};
