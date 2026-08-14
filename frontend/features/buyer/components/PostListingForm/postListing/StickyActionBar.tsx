"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface StickyActionBarProps {
	onSaveDraft: () => void;
	onPublish: () => void;
	isLoading?: boolean;
}

export default function StickyActionBar({ onSaveDraft, onPublish, isLoading }: StickyActionBarProps) {
	const t = useTranslations("StickyActionBar");
	return (
		<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-8 py-4 z-40 lg:ml-64">
			<div className="flex items-center justify-between">
				<p className="text-sm text-gray-600">{t("confirmMessage")}</p>
				<div className="flex gap-3">
					<button
						onClick={onSaveDraft}
						disabled={isLoading}
						className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
						{t("saveDraft")}
					</button>
					<button
						onClick={onPublish}
						disabled={isLoading}
						className="px-8 py-2 bg-[#1B3A6B] text-white font-medium rounded-lg hover:bg-[#152d54] disabled:opacity-50 transition-colors">
						{isLoading ? t("publishing") : t("publish")}
					</button>
				</div>
			</div>
		</div>
	);
}