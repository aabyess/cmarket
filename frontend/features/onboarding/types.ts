// features/onboarding/types.ts
export type OnboardingChecklistItemKind = "verification" | "firstAction" | "bankAccount" | "logo";

export type OnboardingChecklistItem = {
	kind: OnboardingChecklistItemKind;
	completed: boolean;
	label: string;
	href: string;
};

export type OnboardingChecklist = {
	items: OnboardingChecklistItem[];
	allCompleted: boolean;
};
