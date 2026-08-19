// features/chat/components/ChatStartLoadingModal/index.tsx
"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

type ChatStartLoadingModalProps = {
	step: "preparing" | "navigating";
};

export function ChatStartLoadingModal({ step }: ChatStartLoadingModalProps): React.ReactNode {
	const t = useTranslations("ChatStartLoadingModal");

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
			<div className="flex w-80 flex-col items-center gap-4 rounded-2xl bg-white p-10 shadow-xl">
				<div className="relative">
					<div className="flex size-16 items-center justify-center rounded-full bg-imsg-blue">
						<FileText size={32} className="text-white" />
					</div>
					<div
						className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 animate-spin"
						style={{ animationDuration: "3s" }}
					/>
				</div>
				<div className="flex flex-col items-center gap-1 text-center">
					<p className="font-semibold text-[#1F2937]">
						{step === "preparing" ? t("preparingTitle") : t("navigatingTitle")}
					</p>
					<p className="text-sm text-imsg-blue">{t("subtitle")}</p>
				</div>
			</div>
		</div>
	);
}
