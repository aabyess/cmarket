"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/utils/cn";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type CalendarModalProps = {
	isOpen: boolean;
	onClose: () => void;
	value: string | null;
	onSelect: (isoDate: string) => void;
};

function toISODate(year: number, month: number, day: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarModal({ isOpen, onClose, value, onSelect }: CalendarModalProps) {
	const initial = value ? new Date(value) : new Date();
	const [viewYear, setViewYear] = useState(initial.getFullYear());
	const [viewMonth, setViewMonth] = useState(initial.getMonth());

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
	const cells: (number | null)[] = [
		...Array(firstDayOfMonth).fill(null),
		...Array.from({ length: daysInMonth }, (_, i) => i + 1),
	];

	function changeMonth(delta: number): void {
		const next = new Date(viewYear, viewMonth + delta, 1);
		setViewYear(next.getFullYear());
		setViewMonth(next.getMonth());
	}

	function changeYear(delta: number): void {
		setViewYear((prev) => prev + delta);
	}

	function handleSelect(day: number): void {
		onSelect(toISODate(viewYear, viewMonth, day));
		onClose();
	}

	return (
		<Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<DialogPanel className="w-full max-w-sm rounded-2xl bg-white p-5">
					<DialogTitle className="sr-only">납기일 선택</DialogTitle>

					<div className="mb-4 flex items-center justify-between">
						<div className="flex items-center gap-1">
							<button
								onClick={() => changeYear(-1)}
								className="flex size-7 items-center justify-center rounded text-[#6B7280] hover:bg-[#F3F4F6]"
							>
								<ChevronsLeft size={15} />
							</button>
							<button
								onClick={() => changeMonth(-1)}
								className="flex size-7 items-center justify-center rounded text-[#6B7280] hover:bg-[#F3F4F6]"
							>
								<ChevronLeft size={15} />
							</button>
						</div>
						<p className="text-sm font-semibold text-[#1F2937]">
							{viewYear}년 {viewMonth + 1}월
						</p>
						<div className="flex items-center gap-1">
							<button
								onClick={() => changeMonth(1)}
								className="flex size-7 items-center justify-center rounded text-[#6B7280] hover:bg-[#F3F4F6]"
							>
								<ChevronRight size={15} />
							</button>
							<button
								onClick={() => changeYear(1)}
								className="flex size-7 items-center justify-center rounded text-[#6B7280] hover:bg-[#F3F4F6]"
							>
								<ChevronsRight size={15} />
							</button>
						</div>
					</div>

					<div className="grid grid-cols-7 gap-1 text-center">
						{WEEKDAYS.map((day, i) => (
							<span
								key={day}
								className={cn(
									"py-1.5 text-xs font-medium",
									i === 0 ? "text-[#DC2626]" : i === 6 ? "text-imsg-blue" : "text-[#9CA3AF]",
								)}
							>
								{day}
							</span>
						))}
						{cells.map((day, i) => {
							if (day === null) return <span key={`empty-${i}`} />;

							const cellDate = new Date(viewYear, viewMonth, day);
							const isPast = cellDate < today;
							const isSelected = value === toISODate(viewYear, viewMonth, day);

							return (
								<button
									key={day}
									disabled={isPast}
									onClick={() => handleSelect(day)}
									className={cn(
										"flex h-9 items-center justify-center rounded-lg text-sm transition-colors",
										isSelected
											? "bg-imsg-blue font-semibold text-white"
											: isPast
												? "text-[#D1D5DB]"
												: "text-[#374151] hover:bg-[#F3F4F6]",
									)}
								>
									{day}
								</button>
							);
						})}
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
}