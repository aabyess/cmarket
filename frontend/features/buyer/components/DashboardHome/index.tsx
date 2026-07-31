"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DashboardHomeEmptyState } from "@/features/buyer/components/DashboardHome/DashboardHomeEmptyState";
import { DashboardHomeWaiting } from "@/features/buyer/components/DashboardHome/DashboardHomeWaiting";
import { DashboardHomeTodoCard } from "@/features/buyer/components/DashboardHome/DashboardHomeTodoCard";
import { DashboardHomeNextTodos } from "@/features/buyer/components/DashboardHome/DashboardHomeNextTodos";
import { DashboardHomeSavingsCard } from "@/features/buyer/components/DashboardHome/DashboardHomeSavingsCard";
import { DashboardHomeQuickMenu } from "@/features/buyer/components/DashboardHome/DashboardHomeQuickMenu";
import { DashboardHomeActivityFeed } from "@/features/buyer/components/DashboardHome/DashboardHomeActivityFeed";
import type { BuyerDashboardData, BuyerTodo } from "@/features/buyer/types";
import { DashboardHomeTrustPanel } from "@/features/buyer/components/DashboardHome/DashboardHomeTrustPanel";

type DashboardHomeProps = {
	companyName: string;
	data: BuyerDashboardData;
};

export function DashboardHome({ companyName, data }: DashboardHomeProps) {
	const router = useRouter();
	const [activeTodoId, setActiveTodoId] = useState<string | null>(null);

	const activeTodo = data.todos.find((todo) => todo.id === activeTodoId) ?? data.todos[0];
	const restTodos = data.todos.filter((todo) => todo.id !== activeTodo?.id);
	const hasCompletedDeals = data.savings.completedCount > 0;

	function handleNavigate(href: string) {
		router.push(href);
	}

	function handleTodoAction(todo: BuyerTodo) {
		router.push(`/buyer/quote-review?listingId=${todo.listingId}`);
	}

	function handleSelectTodo(todo: BuyerTodo) {
		setActiveTodoId(todo.id);
	}

	if (data.listingCount === 0) {
		return (
			<div className="w-full">
				<div className="mb-3.5">
					<p className="text-[17px] font-medium text-[#1F2937]">{companyName}</p>
					<p className="mt-px text-xs text-[#6B7280]">
						Selamat datang 👋 · 첫 공고를 올려볼까요?
					</p>
				</div>

				<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
					<DashboardHomeEmptyState
						onCreateListing={() => handleNavigate("/buyer/post-listing")}
						onBrowseExamples={() => handleNavigate("/buyer/order-list")}
					/>
					<DashboardHomeTrustPanel />
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="mb-3.5 flex items-end justify-between">
				<div>
					<p className="text-[17px] font-medium text-[#1F2937]">{companyName}</p>
					<p className="mt-px text-xs text-[#6B7280]">
						Selamat pagi · 할 일 {data.todos.length}개
					</p>
				</div>
				<button
					onClick={() => handleNavigate("/buyer/post-listing")}
					className="flex items-center gap-1.5 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2563EB]"
				>
					<Plus size={15} />
					새 공고
				</button>
			</div>

			<div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div>
					{activeTodo ? (
						<>
							<DashboardHomeTodoCard todo={activeTodo} onAction={handleTodoAction} />
							<DashboardHomeNextTodos todos={restTodos} onSelectTodo={handleSelectTodo} />
						</>
					) : (
						<DashboardHomeWaiting
							listingCount={data.listingCount}
							onViewListings={() => handleNavigate("/buyer/order-list")}
						/>
					)}
				</div>

				<div>
					{hasCompletedDeals && <DashboardHomeSavingsCard savings={data.savings} />}
					<DashboardHomeQuickMenu badges={data.badges} onNavigate={handleNavigate} />
					<DashboardHomeActivityFeed
						activities={data.activities}
						onViewAll={() => handleNavigate("/buyer/order-list")}
					/>
				</div>
			</div>
		</div>
	);
}