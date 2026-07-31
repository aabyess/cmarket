"use client";

import { MailOpen } from "lucide-react";
import type { BuyerTodo } from "@/features/buyer/types";

type DashboardHomeTodoCardProps = {
	todo: BuyerTodo;
	onAction: (todo: BuyerTodo) => void;
};

export function DashboardHomeTodoCard({ todo, onAction }: DashboardHomeTodoCardProps) {
	return (
		<div className="rounded-2xl border-2 border-[#3B82F6] bg-white p-5">
			<div className="mb-2.5 flex items-center gap-2">
				<span className="flex size-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#EFF6FF]">
					<MailOpen size={16} className="text-[#3B82F6]" />
				</span>
				{todo.deadlineText && (
					<span className="text-xs text-[#D97706]">{todo.deadlineText}</span>
				)}
			</div>

			<p className="text-[17px] font-medium leading-snug text-[#1F2937]">{todo.title}</p>
			<p className="mt-1 text-[13px] text-[#6B7280]">{todo.description}</p>

			{todo.highlights.length > 0 && (
				<div className="mt-3.5 flex gap-2">
					{todo.highlights.map((highlight) => (
						<div key={highlight.label} className="flex-1 rounded-[10px] bg-[#F9FAFB] px-3 py-2.5">
							<p className="text-[11px] text-[#6B7280]">{highlight.label}</p>
							<p className="mt-0.5 truncate text-sm font-medium text-[#1F2937]">
								{highlight.value}
							</p>
						</div>
					))}
				</div>
			)}

			<button
				onClick={() => onAction(todo)}
				className="mt-3.5 w-full rounded-lg bg-[#3B82F6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
			>
				{todo.actionLabel}
			</button>
		</div>
	);
}