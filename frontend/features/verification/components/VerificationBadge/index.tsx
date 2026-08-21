// features/verification/components/VerificationBadge/index.tsx
"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck, Clock } from "lucide-react";
import { cn } from "@/utils/cn";
import type { VerificationStatus } from "@/features/verification/types";

type VerificationBadgeProps = {
	status: VerificationStatus;
	className?: string;
};

// unverified/rejected는 화면에 아무것도 표시하지 않는다 — 미인증이 기본 상태라
// 모든 곳에 "미인증" 배지를 붙이면 오히려 소음이 된다.
export function VerificationBadge({ status, className }: VerificationBadgeProps): React.ReactNode {
	const t = useTranslations("VerificationBadge");

	if (status === "verified") {
		return (
			<span
				title={t("verifiedTooltip")}
				className={cn(
					"flex w-fit items-center gap-1 rounded-full bg-[#EFF6FF] px-2 py-0.5 text-xs font-medium text-imsg-blue",
					className,
				)}>
				<BadgeCheck size={12} />
				{t("verifiedLabel")}
			</span>
		);
	}

	if (status === "pending") {
		return (
			<span
				title={t("pendingTooltip")}
				className={cn(
					"flex w-fit items-center gap-1 rounded-full bg-[#FFFBEB] px-2 py-0.5 text-xs font-medium text-[#D97706]",
					className,
				)}>
				<Clock size={12} />
				{t("pendingLabel")}
			</span>
		);
	}

	return null;
}
