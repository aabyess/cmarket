// features/seller/components/DashboardHome/SellerDashboardTodo.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { DashboardTodoRow } from "@/features/shared/components/DashboardTodoRow";
import { DashboardWidgetRemoveButton } from "@/features/shared/components/DashboardWidgetRemoveButton";
import { ViewModeToggle, type ViewMode } from "@/components/commons/ViewModeToggle";
import { cn } from "@/utils/cn";
import type { SellerTodo, SellerTodoKind } from "@/features/seller/types";

type SellerDashboardTodoProps = {
	todos: SellerTodo[];
	isEditing: boolean;
	onRemove: () => void;
	removeAriaLabel: string;
};

const KIND_LABEL_KEY: Record<SellerTodoKind, string> = {
	quotePending: "kindQuotePending",
	awarded: "kindAwarded",
	deliveryDue: "kindDeliveryDue",
	paymentConfirm: "kindPaymentConfirm",
};

export function SellerDashboardTodo({
	todos,
	isEditing,
	onRemove,
	removeAriaLabel,
}: SellerDashboardTodoProps): React.JSX.Element {
	const t = useTranslations("SellerDashboard");
	const router = useRouter();
	const prefersReducedMotion = useReducedMotion();
	const [viewMode, setViewMode] = usePersistentState<ViewMode>(
		"mitrapay:seller-dashboard-todo-view",
		"grid",
	);
	// 새로고침하면 기본값(펼침)으로 돌아가야 해서 영속화하지 않는다.
	const [isExpanded, setIsExpanded] = useState(true);

	function handleAction(todo: SellerTodo): void {
		if (todo.kind === "quotePending") {
			router.push(`/seller/listing-browse/${todo.listingId}`);
			return;
		}
		if (todo.kind === "paymentConfirm") {
			router.push("/seller/payments");
			return;
		}
		router.push("/seller/contract");
	}

	const urgentCount = todos.filter((todo) => todo.highlights.length > 0).length;

	return (
		<div className="relative mb-6 rounded-2xl bg-white shadow-sm">
			{isEditing && <DashboardWidgetRemoveButton label={removeAriaLabel} onRemove={onRemove} />}
			<div className="flex items-center justify-between px-5 py-4">
				<div className="flex items-center gap-2">
					<h2 className="text-base font-semibold text-[#0f172a]">{t("todoTitle")}</h2>
					{todos.length > 0 && (
						<span className="text-imsg-secondary text-sm font-normal">
							{t("todoCount", { count: todos.length })}
						</span>
					)}
					{urgentCount > 0 && (
						<span className="rounded-full bg-[#FEF2F2] px-2 py-0.5 text-sm font-semibold text-[#DC2626]">
							{t("urgentCount", { count: urgentCount })}
						</span>
					)}
				</div>
				{todos.length > 0 && <ViewModeToggle value={viewMode} onChange={setViewMode} />}
			</div>

			<div className="h-px bg-[#F2F2F7]" />

			{todos.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-16 text-center">
					<div className="bg-imsg-surface mb-3 flex size-12 items-center justify-center rounded-full">
						<Clock size={20} className="text-imsg-secondary" />
					</div>
					<p className="text-base font-medium text-[#0f172a]">{t("todoEmptyTitle")}</p>
					<p className="text-imsg-secondary mt-1 text-sm">{t("todoEmptyDescription")}</p>
				</div>
			) : (
				<>
					<AnimatePresence initial={false}>
						{isExpanded && (
							<motion.div
								key="todo-list"
								initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
								transition={
									prefersReducedMotion
										? { duration: 0 }
										: { type: "spring", stiffness: 400, damping: 34 }
								}
								className="overflow-hidden">
								<ul
									className={cn(
										viewMode === "list"
											? "divide-y divide-[#F2F2F7]"
											: "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2 p-3",
									)}>
									{todos.map((todo) => (
										<DashboardTodoRow
											key={todo.id}
											id={todo.id}
											variant={viewMode === "list" ? "row" : "card"}
											kind={todo.kind}
											kindLabel={t(KIND_LABEL_KEY[todo.kind])}
											title={todo.title}
											deadlineText={todo.deadlineText}
											isUrgent={todo.highlights.length > 0}
											// awarded는 조회 조건 자체가 "확정 3일 이내"라 노출되는 순간 항상 "신규"다.
											isNew={todo.kind === "awarded"}
											urgentLabel={t("urgentBadge")}
											newLabel={t("newBadge")}
											onClick={() => handleAction(todo)}
										/>
									))}
								</ul>
							</motion.div>
						)}
					</AnimatePresence>
					<button
						type="button"
						onClick={() => setIsExpanded((prev) => !prev)}
						aria-label={isExpanded ? t("collapseListAria") : t("expandListAria")}
						className="text-imsg-secondary hover:bg-imsg-surface flex w-full items-center justify-center border-t border-[#F2F2F7] py-2 transition-colors hover:text-[#374151]">
						{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
					</button>
				</>
			)}
		</div>
	);
}
