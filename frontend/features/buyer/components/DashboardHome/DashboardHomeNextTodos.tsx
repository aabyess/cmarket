"use client";

import type { BuyerTodo } from "@/features/buyer/types";

type DashboardHomeNextTodosProps = {
	todos: BuyerTodo[];
	onSelectTodo: (todo: BuyerTodo) => void;
};

export function DashboardHomeNextTodos({ todos, onSelectTodo }: DashboardHomeNextTodosProps) {
	if (todos.length === 0) return null;

	return (
		<div className="mt-4">
			<p className="mb-2 text-xs text-[#6B7280]">다음 할 일 {todos.length}개</p>

			<div className="space-y-2">
				{todos.map((todo) => (
					<button
						key={todo.id}
						onClick={() => onSelectTodo(todo)}
						className="flex w-full items-center justify-between gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-left transition-colors hover:bg-gray-50"
					>
						<div className="min-w-0">
							<p className="truncate text-xs font-medium text-[#1F2937]">{todo.title}</p>
							<p className="truncate text-xs text-[#6B7280]">{todo.description}</p>
						</div>
						<span className="shrink-0 text-xs text-[#9CA3AF]">
							{todo.deadlineText ?? "확인 필요"}
						</span>
					</button>
				))}
			</div>
		</div>
	);
}