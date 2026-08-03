"use client";

import Image from "next/image";
import { cn } from "@/utils/cn";

const COUNTRY_CONFIG = {
	indonesia: { flagUrl: "https://flagcdn.com/w80/id.png", label: "인도네시아" },
	korea: { flagUrl: "https://flagcdn.com/w80/kr.png", label: "대한민국" },
} as const;

type UserBadgeProps = {
	country: "indonesia" | "korea";
	size?: "sm" | "md";
	className?: string;
};

export function UserBadge({ country, size = "sm", className }: UserBadgeProps) {
	const { flagUrl, label } = COUNTRY_CONFIG[country];
	const width = size === "sm" ? 24 : 32;
	const height = size === "sm" ? 18 : 24;

	return (
		<Image
			src={flagUrl}
			alt={label}
			title={label}
			width={width}
			height={height}
			className={cn("rounded-[3px] border border-[#D1D5DB] object-cover", className)}
			unoptimized
		/>
	);
}