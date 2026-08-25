import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
	DashboardTodoAgenda,
	type DashboardTodoAgendaItem,
} from "@/features/shared/components/DashboardTodoAgenda";

const now = new Date("2026-08-25T09:00:00.000Z");

function daysFromNow(days: number): string {
	return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

const MOCK_ITEMS: DashboardTodoAgendaItem[] = [
	{
		id: "1",
		title: "실험실용 원심분리기 12대 견적 검토 필요",
		deadlineText: "마감 지남",
		dueTime: daysFromNow(-1),
		isUrgent: true,
		onClick: () => {},
	},
	{
		id: "2",
		title: "사무용 복합기 30대 계약 확정",
		deadlineText: "오늘",
		dueTime: daysFromNow(0),
		isUrgent: false,
		isNew: true,
		onClick: () => {},
	},
	{
		id: "3",
		title: "산업용 펌프 5대 입금 확인 필요",
		deadlineText: "내일",
		dueTime: daysFromNow(1),
		isUrgent: false,
		onClick: () => {},
	},
	{
		id: "4",
		title: "화학약품 보관 캐비닛 8개 납품 준비",
		deadlineText: "D-4",
		dueTime: daysFromNow(4),
		isUrgent: false,
		onClick: () => {},
	},
	{
		id: "5",
		title: "산업용 밸브 200개 견적 검토",
		deadlineText: "D-12",
		dueTime: daysFromNow(12),
		isUrgent: false,
		onClick: () => {},
	},
];

const meta: Meta<typeof DashboardTodoAgenda> = {
	title: "Shared/DashboardTodoAgenda",
	component: DashboardTodoAgenda,
	args: {
		items: MOCK_ITEMS,
		urgentLabel: "긴급",
		newLabel: "신규",
	},
};

export default meta;
type Story = StoryObj<typeof DashboardTodoAgenda>;

export const Default: Story = {};

export const Empty: Story = {
	args: { items: [] },
};
