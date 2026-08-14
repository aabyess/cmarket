"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { ArrowDown, ArrowUp, ChevronDown, Trash2 } from "lucide-react";
import { SiteBuilderBlockEditor } from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderBlockEditor";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { BLOCK_DESCRIPTIONS, BLOCK_ICONS, BLOCK_LABELS } from "@/features/siteBuilder/constants";
import { cn } from "@/utils/cn";
import type { Block } from "@/features/siteBuilder/types";

type SiteBuilderBlockCardProps = {
	block: Block;
	isFirst: boolean;
	isLast: boolean;
	isOpen: boolean;
	onToggle: () => void;
	onChange: (block: Block) => void;
	onMove: (direction: -1 | 1) => void;
	onRemove: () => void;
};

const ICON_BUTTON_CLASS =
	"flex size-7 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151] disabled:cursor-not-allowed disabled:opacity-30";

const toggleChevron = cva("shrink-0 text-[#9CA3AF] transition-transform", {
	variants: {
		open: {
			true: "rotate-180",
			false: "rotate-0",
		},
	},
	defaultVariants: { open: false },
});

export function SiteBuilderBlockCard({
	block,
	isFirst,
	isLast,
	isOpen,
	onToggle,
	onChange,
	onMove,
	onRemove,
}: SiteBuilderBlockCardProps): React.JSX.Element {
	const Icon = BLOCK_ICONS[block.type];
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	return (
		<div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
			<div className="flex items-center gap-3 px-4 py-3">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6FF]">
					<Icon size={16} className="text-imsg-blue" />
				</span>

				<button
					type="button"
					onClick={onToggle}
					aria-expanded={isOpen}
					className="flex min-w-0 flex-1 items-center gap-2 text-left">
					<span className="min-w-0 flex-1">
						<span className="block text-sm font-semibold text-[#1F2937]">
							{BLOCK_LABELS[block.type]}
						</span>
						<span className="block truncate text-xs text-[#9CA3AF]">
							{BLOCK_DESCRIPTIONS[block.type]}
						</span>
					</span>
					<ChevronDown size={16} className={toggleChevron({ open: isOpen })} />
					<span className="shrink-0 text-xs text-[#9CA3AF]">{isOpen ? "접기" : "펼치기"}</span>
				</button>

				<span className="h-6 w-px shrink-0 bg-[#F3F4F6]" />

				<div className="flex shrink-0 items-center gap-0.5">
					<button
						type="button"
						onClick={() => onMove(-1)}
						disabled={isFirst}
						title="위로 이동"
						aria-label="블록을 위로 이동"
						className={ICON_BUTTON_CLASS}>
						<ArrowUp size={15} />
					</button>
					<button
						type="button"
						onClick={() => onMove(1)}
						disabled={isLast}
						title="아래로 이동"
						aria-label="블록을 아래로 이동"
						className={ICON_BUTTON_CLASS}>
						<ArrowDown size={15} />
					</button>
					<button
						type="button"
						onClick={() => setIsConfirmOpen(true)}
						title="블록 삭제"
						aria-label="블록 삭제"
						className={cn(ICON_BUTTON_CLASS, "hover:text-[#DC2626]")}>
						<Trash2 size={15} />
					</button>
				</div>
			</div>

			{isOpen && (
				<div className="border-t border-[#F3F4F6] px-4 py-5">
					<SiteBuilderBlockEditor block={block} onChange={onChange} />
				</div>
			)}

			<ConfirmModal
				isOpen={isConfirmOpen}
				title="이 블록을 삭제할까요?"
				description="삭제하면 되돌릴 수 없습니다."
				confirmLabel="삭제"
				variant="danger"
				onConfirm={() => {
					onRemove();
					setIsConfirmOpen(false);
				}}
				onClose={() => setIsConfirmOpen(false)}
			/>
		</div>
	);
}
