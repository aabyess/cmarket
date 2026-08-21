// features/seller/components/DashboardHome/SellerDashboardTodo.tsx
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
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
					<div className="mb-3 flex size-12 items-center justify-center rounded-full bg-imsg-surface">
						<Clock size={20} className="text-imsg-secondary" />
					</div>
					<p className="text-base font-medium text-[#0f172a]">{t("todoEmptyTitle")}</p>
					<p className="mt-1 text-sm text-imsg-secondary">{t("todoEmptyDescription")}</p>
				</div>
			) : (
				<ul>
					{todos.map((todo, i) => {
						const isUrgent = todo.highlights.length > 0;
						// awarded는 조회 조건 자체가 "확정 3일 이내"라 노출되는 순간 항상 "신규"다.
						const isNew = todo.kind === "awarded";

						return (
							<li
								key={todo.id}
								onClick={() => handleAction(todo)}
								className={cn(
									"flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-imsg-surface",
									i !== todos.length - 1 && "border-b border-[#F2F2F7]",
									isUrgent ? "border-l-2 border-l-red-400" : "border-l-2 border-l-imsg-blue",
								)}>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<h3 className="truncate text-base font-semibold text-[#0f172a]">{todo.title}</h3>
										{isUrgent && (
											<span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-sm font-semibold text-red-500">
												{t("urgentBadge")}
											</span>
										)}
										{!isUrgent && isNew && (
											<span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold text-imsg-blue">
												{t("newBadge")}
											</span>
										)}
									</div>
									<p className="mt-0.5 text-sm text-imsg-secondary">{todo.description}</p>
									{todo.deadlineText && (
										<div className="mt-1.5 flex items-center gap-1 text-sm text-imsg-secondary">
											<Clock size={11} />
											<span className={isUrgent ? "text-red-500" : ""}>{todo.deadlineText}</span>
										</div>
									)}
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										handleAction(todo);
									}}
									className={cn(
										"flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
										isUrgent
											? "bg-imsg-blue text-white hover:bg-blue-600"
											: "bg-imsg-surface text-[#0f172a] hover:bg-[#E5E7EB]",
									)}>
									{todo.actionLabel}
									<ArrowRight size={12} />
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
