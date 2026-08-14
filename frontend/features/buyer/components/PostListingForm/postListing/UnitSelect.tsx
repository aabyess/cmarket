"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

const UNIT_OPTIONS: { value: string; desc: string }[] = [
	{ value: "EA", desc: "개" },
	{ value: "SET", desc: "세트" },
	{ value: "BOX", desc: "박스" },
	{ value: "식", desc: "전체" },
	{ value: "건", desc: "사건/업무" },
	{ value: "명", desc: "인원" },
	{ value: "회", desc: "횟수" },
	{ value: "일", desc: "날짜/기간" },
	{ value: "개월", desc: "기간" },
	{ value: "조", desc: "그룹/세트" },
	{ value: "벌", desc: "옷/세트" },
	{ value: "권", desc: "책/서류" },
	{ value: "부", desc: "서류/인쇄물" },
	{ value: "포", desc: "포장단위" },
	{ value: "KG", desc: "킬로그램" },
	{ value: "TON", desc: "톤" },
	{ value: "L", desc: "리터" },
	{ value: "M", desc: "미터" },
	{ value: "M2", desc: "제곱미터" },
];

type UnitSelectProps = {
	value: string;
	onChange: (value: string) => void;
};

export default function UnitSelect({ value, onChange }: UnitSelectProps): React.ReactNode {
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent): void {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function handleSelect(unit: string): void {
		onChange(unit);
		setIsOpen(false);
	}

	return (
		<div className="relative" ref={ref}>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onFocus={() => setIsOpen(true)}
				placeholder="단위"
				className="w-full rounded border border-[#E2E8F0] px-2 py-1.5 text-sm text-[#374151] focus:border-imsg-blue focus:outline-none"
			/>

			{isOpen && (
				<div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-40 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
					{UNIT_OPTIONS.map((option) => (
						<button
							key={option.value}
							type="button"
							onClick={() => handleSelect(option.value)}
							className={cn(
								"flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-[#F9FAFB]",
								value === option.value && "bg-[#EFF6FF]",
							)}
						>
							<span>
								<span
									className={cn(
										"block text-sm font-medium",
										value === option.value ? "text-imsg-blue" : "text-[#1F2937]",
									)}
								>
									{option.value}
								</span>
								<span className="block text-xs text-[#9CA3AF]">{option.desc}</span>
							</span>
							{value === option.value && <Check size={14} className="shrink-0 text-imsg-blue" />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}