import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SiteBuilder } from "@/features/siteBuilder/components/SiteBuilder";
import { MOCK_BLOCKS, MOCK_COMPANY_INFO } from "@/features/siteBuilder/mocks";
import type { SiteEditorData } from "@/features/siteBuilder/types";

const BASE_DATA: SiteEditorData = {
	tenantId: "tenant-1",
	profileId: "profile-1",
	pageId: "page-1",
	status: "DRAFT",
	blocks: MOCK_BLOCKS,
	isSeeded: false,
	hasPublished: true,
	hasUnpublishedChanges: false,
	settings: {
		logoUrl: "",
		categories: ["machinery", "lab"],
		bankAccount: {
			bankName: "국민은행",
			accountNumber: "123-456-789012",
			accountHolder: "대한정밀공업",
			swiftCode: "CZNBKRSE",
			currency: "KRW",
		},
		company: MOCK_COMPANY_INFO,
		contact: {
			name: "김수출",
			title: "과장",
			department: "해외영업팀",
			email: "export@daehan-precision.kr",
			phone: "031-123-4567",
			mobile: "010-1234-5678",
		},
	},
};

const meta: Meta<typeof SiteBuilder> = {
	title: "siteBuilder/SiteBuilder",
	component: SiteBuilder,
};

export default meta;

type Story = StoryObj<typeof SiteBuilder>;

export const Published: Story = {
	args: { role: "seller", data: BASE_DATA },
};

export const UnpublishedChanges: Story = {
	args: { role: "seller", data: { ...BASE_DATA, hasUnpublishedChanges: true } },
};

export const Empty: Story = {
	args: { role: "seller", data: { ...BASE_DATA, blocks: [], hasPublished: false } },
};

export const Seeded: Story = {
	args: { role: "seller", data: { ...BASE_DATA, isSeeded: true, hasPublished: false } },
};

export const BuyerRole: Story = {
	args: { role: "buyer", data: BASE_DATA, initialTab: "SETTINGS" },
};
