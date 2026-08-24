// features/seller/components/DashboardHome/SellerDashboardTodo.tsx
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Clock } from "lucide-react";
import { DashboardTodoRow } from "@/features/shared/components/DashboardTodoRow";
import type { SellerTodo } from "@/features/seller/types";

type SellerDashboardTodoProps = {
	todos: SellerTodo[];
};

export function SellerDashboardTodo({ todos }: SellerDashboardTodoProps): React.JSX.Element {
	const t = useTranslations("SellerDashboard");
	const router = useRouter();

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
		<div className="mb-6 rounded-2xl bg-white shadow-sm">
			<div className="flex items-center justify-between px-5 py-4">
				<div className="flex items-center gap-2">
					<h2 className="text-base font-semibold text-[#0f172a]">{t("todoTitle")}</h2>
					{todos.length > 0 && (
						<span className="text-imsg-secondary text-sm font-normal">
							{t("todoCount", { count: todos.length })}
						</span>
					)}
					{urgentCount > 0 && (
						<span className="rounded-full bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-500">
							{t("urgentCount", { count: urgentCount })}
						</span>
					)}
				</div>
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
				<ul className="divide-y divide-[#F2F2F7]">
					{todos.map((todo) => (
						<DashboardTodoRow
							key={todo.id}
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
			)}
		</div>
	);
}
