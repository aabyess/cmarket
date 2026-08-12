import type { Meta, StoryObj } from "@storybook/react";
import { SiteBuilder } from "@/features/siteBuilder/components/SiteBuilder";
import { MOCK_BLOCKS, MOCK_COMPANY_INFO } from "@/features/siteBuilder/mocks";
import type { SiteEditorData } from "@/features/siteBuilder/types";

const BASE_DATA: SiteEditorData = {
	tenantId: "tenant-1",
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
	},
	company: MOCK_COMPANY_INFO,
};

const meta: Meta<typeof SiteBuilder> = {
	title: "siteBuilder/SiteBuilder",
	component: SiteBuilder,
};

export default meta;

type Story = StoryObj<typeof SiteBuilder>;

export const Published: Story = {
	args: { data: BASE_DATA },
};

export const UnpublishedChanges: Story = {
	args: { data: { ...BASE_DATA, hasUnpublishedChanges: true } },
};

export const Empty: Story = {
	args: { data: { ...BASE_DATA, blocks: [], hasPublished: false } },
};

export const Seeded: Story = {
	args: { data: { ...BASE_DATA, isSeeded: true, hasPublished: false } },
};
