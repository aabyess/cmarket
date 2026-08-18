"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

const UNIT_VALUES = [
	"EA",
	"SET",
	"BOX",
	"식",
	"건",
	"명",
	"회",
	"일",
	"개월",
	"조",
	"벌",
	"권",
	"부",
	"포",
	"KG",
	"TON",
	"L",
	"M",
	"M2",
] as const;

type UnitSelectProps = {
	value: string;
	onChange: (value: string) => void;
};

export default function UnitSelect({ value, onChange }: UnitSelectProps): React.ReactNode {
	const t = useTranslations("UnitSelect");
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
				placeholder={t("placeholder")}
				className="w-full rounded border border-[#E2E8F0] px-2 py-1.5 text-sm text-[#374151] focus:border-imsg-blue focus:outline-none"
			/>

			{isOpen && (
				<div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-40 overflow-y-auto rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
					{UNIT_VALUES.map((unitValue) => (
						<button
							key={unitValue}
							type="button"
							onClick={() => handleSelect(unitValue)}
							className={cn(
								"flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-[#F9FAFB]",
								value === unitValue && "bg-[#EFF6FF]",
							)}
						>
							<span>
								<span
									className={cn(
										"block text-sm font-medium",
										value === unitValue ? "text-imsg-blue" : "text-[#1F2937]",
									)}
								>
									{unitValue}
								</span>
								<span className="block text-xs text-[#9CA3AF]">{t(`descriptions.${unitValue}`)}</span>
							</span>
							{value === unitValue && <Check size={14} className="shrink-0 text-imsg-blue" />}
						</button>
					))}
				</div>
			)}
		</div>
	);
}