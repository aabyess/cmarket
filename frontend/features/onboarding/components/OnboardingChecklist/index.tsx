// features/onboarding/components/OnboardingChecklist/index.tsx
"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, Circle, ListChecks, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { OnboardingChecklist as OnboardingChecklistData } from "@/features/onboarding/types";

type OnboardingChecklistProps = {
	checklist: OnboardingChecklistData;
};

// 완료 항목이 하나도 안 남으면(전부 체크) 위젯 자체를 아예 렌더하지 않는다 — 신규
// 가입자에게만 잠깐 보이는 온보딩 유도 UI라, 다 끝난 뒤에도 남아있으면 소음이 된다.
export function OnboardingChecklist({ checklist }: OnboardingChecklistProps): React.ReactNode {
	const t = useTranslations("OnboardingChecklist");
	const router = useRouter();
	const [dismissed, setDismissed] = usePersistentState("mitrapay:onboarding-checklist-dismissed", false);

	if (checklist.allCompleted) return null;

	const completedCount = checklist.items.filter((item) => item.completed).length;

	if (dismissed) {
		return (
			<button
				type="button"
				onClick={() => setDismissed(false)}
				className="mb-6 flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-medium text-[#6B7280] transition-colors hover:bg-imsg-surface">
				<ListChecks size={13} />
				{t("reopenLabel", { completed: completedCount, total: checklist.items.length })}
			</button>
		);
	}

	return (
		<div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
			<div className="flex items-center justify-between px-5 py-4">
				<div className="flex items-center gap-2">
					<h2 className="text-base font-semibold text-[#0f172a]">{t("title")}</h2>
					<span className="rounded-full bg-blue-50 px-2 py-0.5 text-sm font-semibold text-imsg-blue">
						{t("progress", { completed: completedCount, total: checklist.items.length })}
					</span>
				</div>
				<button
					type="button"
					onClick={() => setDismissed(true)}
					aria-label={t("closeAria")}
					className="flex size-7 items-center justify-center rounded-full text-imsg-secondary transition-colors hover:bg-imsg-surface">
					<X size={16} />
				</button>
			</div>

			<div className="h-px bg-[#F2F2F7]" />

			<ul className="p-2">
				{checklist.items.map((item) => (
					<li key={item.kind}>
						<button
							type="button"
							onClick={() => router.push(item.href)}
							className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-imsg-surface">
							{item.completed ? (
								<CheckCircle2 size={18} className="shrink-0 text-[#16A34A]" />
							) : (
								<Circle size={18} className="shrink-0 text-[#D1D5DB]" />
							)}
							<span
								className={cn(
									"text-sm font-medium",
									item.completed ? "text-imsg-secondary line-through" : "text-[#0f172a]",
								)}>
								{item.label}
							</span>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
