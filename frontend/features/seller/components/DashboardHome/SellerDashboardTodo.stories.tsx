import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SellerDashboardTodo } from "@/features/seller/components/DashboardHome/SellerDashboardTodo";
import type { SellerTodo } from "@/features/seller/types";

const MOCK_TODOS: SellerTodo[] = [
	{
		id: "1",
		kind: "quotePending",
		listingId: "listing-1",
		contractId: null,
		title: "실험실용 원심분리기 12대 견적 검토 필요",
		description: "",
		deadlineText: "D-2",
		actionLabel: "견적 보기",
		highlights: [{ label: "긴급", value: "D-2" }],
	},
	{
		id: "2",
		kind: "awarded",
		listingId: "listing-2",
		contractId: "contract-2",
		title: "사무용 복합기 30대 계약 확정",
		description: "",
		deadlineText: "3일 전",
		actionLabel: "계약 보기",
		highlights: [],
	},
	{
		id: "3",
		kind: "paymentConfirm",
		listingId: null,
		contractId: "contract-3",
		title: "산업용 펌프 5대 입금 확인 필요",
		description: "",
		deadlineText: "1일 전",
		actionLabel: "입금 확인",
		highlights: [],
	},
	{
		id: "4",
		kind: "quotePending",
		listingId: "listing-4",
		contractId: null,
		title: "화학약품 보관 캐비닛 8개 견적 검토 필요",
		description: "",
		deadlineText: "D-6",
		actionLabel: "견적 보기",
		highlights: [],
	},
];

const meta: Meta<typeof SellerDashboardTodo> = {
	title: "seller/SellerDashboardTodo",
	component: SellerDashboardTodo,
};

export default meta;

type Story = StoryObj<typeof SellerDashboardTodo>;

export const Default: Story = {
	args: {
		todos: MOCK_TODOS,
		isEditing: false,
		onRemove: () => {},
		removeAriaLabel: "할 일 위젯 숨기기",
	},
};

export const Empty: Story = {
	args: {
		todos: [],
		isEditing: false,
		onRemove: () => {},
		removeAriaLabel: "할 일 위젯 숨기기",
	},
};
