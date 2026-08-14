"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/features/support/faq";
import { getFaqCategoryLabels, FAQ_CATEGORY_OPTIONS } from "@/features/support/constants";
import type { FaqCategory } from "@/features/support/types";

const categoryButton = cva(
	"rounded-lg px-3 py-2 text-xs font-medium transition-colors duration-200",
	{
		variants: {
			active: {
				true: "bg-imsg-blue text-white",
				false: "text-[#374151] hover:bg-[#F9FAFB]",
			},
		},
		defaultVariants: { active: false },
	},
);

const chevron = cva("shrink-0 text-imsg-secondary transition-transform duration-200", {
	variants: {
		open: { true: "rotate-180", false: "rotate-0" },
	},
	defaultVariants: { open: false },
});

export function SupportFaq(): React.JSX.Element {
	const t = useTranslations("SupportFaq");
	const faqCategoryLabels = getFaqCategoryLabels(useTranslations("FaqCategoryLabel"));
	const [category, setCategory] = useState<FaqCategory | null>(null);
	const [openId, setOpenId] = useState<string | null>(null);

	const items = category ? FAQ_ITEMS.filter((item) => item.category === category) : FAQ_ITEMS;

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				<button
					type="button"
					onClick={() => setCategory(null)}
					className={categoryButton({ active: category === null })}>
					{t("all", { count: FAQ_ITEMS.length })}
				</button>
				{FAQ_CATEGORY_OPTIONS.map((option) => (
					<button
						key={option}
						type="button"
						onClick={() => setCategory(option)}
						className={categoryButton({ active: category === option })}>
						{faqCategoryLabels[option]}{" "}
						{FAQ_ITEMS.filter((item) => item.category === option).length}
					</button>
				))}
			</div>

			<ul className="space-y-2">
				{items.map((item) => (
					<li key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
						<button
							type="button"
							onClick={() => setOpenId(openId === item.id ? null : item.id)}
							aria-expanded={openId === item.id}
							className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-imsg-surface">
							<span className="shrink-0 rounded-full bg-imsg-surface px-2 py-0.5 text-xs font-medium text-imsg-secondary">
								{faqCategoryLabels[item.category]}
							</span>
							<span className="min-w-0 flex-1 text-sm font-medium text-[#0f172a]">
								{item.question}
							</span>
							<ChevronDown size={16} className={chevron({ open: openId === item.id })} />
						</button>

						{openId === item.id && (
							<div className="border-t border-[#F2F2F7] px-5 py-4">
								{item.answer.map((line, i) => (
									<p key={i} className="text-sm leading-relaxed text-[#4B5563]">
										{line}
									</p>
								))}
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
