"use client";

import { Plus } from "lucide-react";
import {
	BLOCK_DESCRIPTIONS,
	BLOCK_ICONS,
	BLOCK_LABELS,
	BLOCK_TYPE_OPTIONS,
} from "@/features/siteBuilder/constants";
import type { BlockType } from "@/features/siteBuilder/types";

type SiteBuilderAddBlockProps = {
	onAdd: (type: BlockType) => void;
};

export function SiteBuilderAddBlock({ onAdd }: SiteBuilderAddBlockProps): React.JSX.Element {
	return (
		<div className="rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white p-5">
			<div className="mb-3.5 flex items-center gap-2">
				<Plus size={15} className="text-[#6B7280]" />
				<h2 className="text-sm font-semibold text-[#1F2937]">블록 추가</h2>
			</div>

			<div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
				{BLOCK_TYPE_OPTIONS.map((type) => {
					const Icon = BLOCK_ICONS[type];

					return (
						<button
							key={type}
							type="button"
							onClick={() => onAdd(type)}
							className="rounded-xl border border-[#E5E7EB] p-3 text-left transition-colors hover:border-[#3B82F6] hover:bg-[#EFF6FF]">
							<Icon size={16} className="mb-2 text-[#3B82F6]" />
							<p className="text-xs font-semibold text-[#374151]">{BLOCK_LABELS[type]}</p>
							<p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[#9CA3AF]">
								{BLOCK_DESCRIPTIONS[type]}
							</p>
						</button>
					);
				})}
			</div>
		</div>
	);
}
