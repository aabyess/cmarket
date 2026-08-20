import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ListingTemplateManager } from "./index";
import messages from "@/messages/ko.json";

// 실제 Supabase 클라이언트로 데이터를 가져오는 컴포넌트라 Storybook에서는
// 목업 서버가 없어 로딩 상태로 렌더된다. QueryClientProvider만 있으면
// react-query가 에러 없이 동작한다.
const meta: Meta<typeof ListingTemplateManager> = {
	title: "listingTemplates/ListingTemplateManager",
	component: ListingTemplateManager,
	decorators: [
		(Story) => (
			<QueryClientProvider client={new QueryClient()}>
				<NextIntlClientProvider locale="ko" messages={messages}>
					<Story />
				</NextIntlClientProvider>
			</QueryClientProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof ListingTemplateManager>;

export const Default: Story = {};
