"use client";

import { useTranslations } from "next-intl";

interface StickyActionBarProps {
	onSaveDraft: () => void;
	onPublish: () => void;
	isLoading?: boolean;
}

export default function StickyActionBar({
	onSaveDraft,
	onPublish,
	isLoading,
}: StickyActionBarProps) {
	const t = useTranslations("StickyActionBar");
	return (
		<div className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#E5E7EB] bg-white px-8 py-4 shadow-lg lg:ml-64">
			<div className="flex items-center justify-between">
				<p className="text-sm text-[#6B7280]">{t("confirmMessage")}</p>
				<div className="flex gap-3">
					<button
						onClick={onSaveDraft}
						disabled={isLoading}
						className="rounded-lg border border-[#E5E7EB] px-6 py-2 font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] disabled:opacity-50">
						{t("saveDraft")}
					</button>
					<button
						onClick={onPublish}
						disabled={isLoading}
						className="bg-imsg-blue rounded-lg px-8 py-2 font-medium text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50">
						{isLoading ? t("publishing") : t("publish")}
					</button>
				</div>
			</div>
		</div>
	);
}
