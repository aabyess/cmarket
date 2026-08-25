// features/shared/components/DashboardTodoAgenda/index.tsx
"use client";

import { useTranslations } from "next-intl";
import { DashboardTodoRow } from "@/features/shared/components/DashboardTodoRow";

export type DashboardTodoAgendaItem = {
	id: string;
	title: string;
	deadlineText: string | null;
	/** 그룹핑 기준 시점, ISO 문자열(BuyerTodo/SellerTodo의 dueTime). */
	dueTime: string;
	isUrgent: boolean;
	isNew?: boolean;
	onClick: () => void;
};

type DashboardTodoAgendaProps = {
	items: DashboardTodoAgendaItem[];
	urgentLabel: string;
	newLabel?: string;
	/** "지남" 그룹 항목에만 적용되는 화면 숨기기 콜백. 값이 없으면 X 버튼을 노출하지 않는다. */
	onDismissItem?: (id: string) => void;
};

type AgendaGroupKey = "overdue" | "today" | "tomorrow" | "thisWeek" | "nextWeek" | "later";

const GROUP_ORDER: AgendaGroupKey[] = [
	"overdue",
	"today",
	"tomorrow",
	"thisWeek",
	"nextWeek",
	"later",
];

const DAY_MS = 1000 * 60 * 60 * 24;

// 오늘/내일 이후는 "이번 주(월~일) 안"과 "다음 주 안"으로 나눈다 — 캘린더 주 경계(월요일 시작)
// 기준으로 계산해서, 예를 들어 오늘이 토요일이면 "이번 주"가 하루(일요일)뿐이어도 그렇게 보여준다.
function resolveGroupKey(dueTimeIso: string, now: Date): AgendaGroupKey {
	const due = new Date(dueTimeIso);
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
	const dayDiff = Math.round((startOfDue.getTime() - startOfToday.getTime()) / DAY_MS);

	if (dayDiff < 0) return "overdue";
	if (dayDiff === 0) return "today";
	if (dayDiff === 1) return "tomorrow";

	const mondayIndex = (startOfToday.getDay() + 6) % 7; // 월=0 ... 일=6
	const daysUntilEndOfThisWeek = 6 - mondayIndex;
	if (dayDiff <= daysUntilEndOfThisWeek) return "thisWeek";
	if (dayDiff <= daysUntilEndOfThisWeek + 7) return "nextWeek";
	return "later";
}

// 할일 위젯의 카드형(grid) 뷰를 대체하는 아젠다형 뷰 — 마감/관련 시점(dueTime) 기준으로
// 지남/오늘/내일/이번주/다음주/이후로 묶어서 보여준다. 그룹 안은 기존 리스트형(row)
// 렌더링을 그대로 재사용해 시각 언어를 유지한다.
export function DashboardTodoAgenda({
	items,
	urgentLabel,
	newLabel,
	onDismissItem,
}: DashboardTodoAgendaProps): React.ReactNode {
	const t = useTranslations("DashboardTodoAgenda");
	const now = new Date();

	const groups = new Map<AgendaGroupKey, DashboardTodoAgendaItem[]>();
	for (const item of items) {
		const key = resolveGroupKey(item.dueTime, now);
		const group = groups.get(key);
		if (group) group.push(item);
		else groups.set(key, [item]);
	}
	for (const group of groups.values()) {
		group.sort((a, b) => new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime());
	}

	const groupLabels: Record<AgendaGroupKey, string> = {
		overdue: t("overdueLabel"),
		today: t("todayLabel"),
		tomorrow: t("tomorrowLabel"),
		thisWeek: t("thisWeekLabel"),
		nextWeek: t("nextWeekLabel"),
		later: t("laterLabel"),
	};

	const visibleGroups = GROUP_ORDER.map((key) => ({ key, items: groups.get(key) })).filter(
		(group): group is { key: AgendaGroupKey; items: DashboardTodoAgendaItem[] } =>
			group.items !== undefined,
	);

	return (
		<div className="flex flex-col gap-3 p-3">
			{visibleGroups.map(({ key, items: groupItems }) => (
				<div key={key}>
					<p className="text-imsg-secondary px-2 pb-1 text-xs font-semibold">{groupLabels[key]}</p>
					<ul className="divide-y divide-[#F2F2F7] overflow-hidden rounded-xl border border-[#F2F2F7]">
						{groupItems.map((item) => (
							<DashboardTodoRow
								key={item.id}
								id={item.id}
								title={item.title}
								deadlineText={item.deadlineText}
								isUrgent={item.isUrgent}
								isNew={item.isNew}
								urgentLabel={urgentLabel}
								newLabel={newLabel}
								onClick={item.onClick}
								onDismiss={
									key === "overdue" && onDismissItem ? () => onDismissItem(item.id) : undefined
								}
								dismissLabel={t("dismissAria")}
							/>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}
