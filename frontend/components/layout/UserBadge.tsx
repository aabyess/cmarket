"use client";

import Image from "next/image";
import { cn } from "@/utils/cn";

const COUNTRY_CONFIG = {
	indonesia: { flagUrl: "https://flagcdn.com/w80/id.png", label: "인도네시아" },
	korea: { flagUrl: "https://flagcdn.com/w80/kr.png", label: "대한민국" },
} as const;

type UserBadgeProps = {
	country: "indonesia" | "korea";
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
};

export function UserBadge({ country, size = "sm", className }: UserBadgeProps) {
	const { flagUrl, label } = COUNTRY_CONFIG[country];

	const SIZE_MAP = {
		sm: { width: 24, height: 18 },
		md: { width: 32, height: 24 },
		lg: { width: 48, height: 36 },
		xl: { width: 72, height: 54 },
	} as const;

	const { width, height } = SIZE_MAP[size];

	return (
		<Image
			src={flagUrl}
			alt={label}
			title={label}
			width={width}
			height={height}
			className={cn("rounded-[4px] border border-[#D1D5DB] object-cover", className)}
			unoptimized
		/>
	);
}