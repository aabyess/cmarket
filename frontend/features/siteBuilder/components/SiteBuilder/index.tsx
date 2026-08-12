"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cva } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { SiteRenderer } from "@/features/siteBuilder/components/SiteRenderer";
import { SiteBuilderAddBlock } from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderAddBlock";
import { SiteBuilderBlockCard } from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderBlockCard";
import { SiteBuilderToolbar } from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderToolbar";
import { SiteBuilderTradeSettings } from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderTradeSettings";
import { createBlock, moveBlock } from "@/features/siteBuilder/utils";
import type { SiteBuilderPublishState } from "@/features/siteBuilder/components/SiteBuilder/SiteBuilderToolbar";
import type { Block, BlockType, SiteEditorData, SiteTradeSettings } from "@/features/siteBuilder/types";

export type BuilderTab = "PAGE" | "SETTINGS";

type SiteBuilderProps = {
	data: SiteEditorData;
	initialTab?: BuilderTab;
};

type Feedback = { kind: "SUCCESS" | "ERROR"; message: string };

const tabButton = cva("rounded-lg px-4 py-2 text-sm font-medium transition-colors", {
	variants: {
		active: {
			true: "bg-[#EFF6FF] text-[#3B82F6]",
			false: "text-[#6B7280] hover:bg-gray-50",
		},
	},
	defaultVariants: { active: false },
});

const feedbackBox = cva("flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium", {
	variants: {
		kind: {
			SUCCESS: "border border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]",
			ERROR: "border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]",
		},
	},
	defaultVariants: { kind: "SUCCESS" },
});

export function SiteBuilder({ data, initialTab = "PAGE" }: SiteBuilderProps): React.JSX.Element {
	const router = useRouter();

	const [tab, setTab] = useState<BuilderTab>(initialTab);
	const [blocks, setBlocks] = useState<Block[]>(data.blocks);
	const [settings, setSettings] = useState<SiteTradeSettings>(data.settings);
	const [openBlockId, setOpenBlockId] = useState<string | null>(data.blocks[0]?.id ?? null);
	const [isPreview, setIsPreview] = useState(false);
	const [isDirty, setIsDirty] = useState(data.isSeeded);
	const [isSaving, setIsSaving] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [isSavingSettings, setIsSavingSettings] = useState(false);
	const [feedback, setFeedback] = useState<Feedback | null>(null);

	function resolvePublishState(): SiteBuilderPublishState {
		if (!data.hasPublished) return "NEVER_PUBLISHED";
		if (isDirty || data.hasUnpublishedChanges) return "UNPUBLISHED_CHANGES";
		return "SYNCED";
	}

	function showFeedback(kind: Feedback["kind"], message: string): void {
		setFeedback({ kind, message });
		setTimeout(() => setFeedback(null), 3000);
	}

	function updateBlocks(next: Block[]): void {
		setBlocks(next);
		setIsDirty(true);
	}

	function handleAddBlock(type: BlockType): void {
		const block = createBlock(type);
		updateBlocks([...blocks, block]);
		setOpenBlockId(block.id);
	}

	async function saveDraft(): Promise<boolean> {
		const res = await fetch("/api/seller/site", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ blocks }),
		});

		if (!res.ok) {
			const { error } = await res.json();
			showFeedback("ERROR", error ?? "저장에 실패했습니다.");
			return false;
		}

		setIsDirty(false);
		return true;
	}

	async function handleSave(): Promise<void> {
		setIsSaving(true);
		try {
			if (await saveDraft()) showFeedback("SUCCESS", "초안이 저장되었습니다.");
		} finally {
			setIsSaving(false);
		}
	}

	async function handlePublish(): Promise<void> {
		setIsPublishing(true);
		try {
			if (!(await saveDraft())) return;

			const res = await fetch("/api/seller/site/publish", { method: "POST" });
			if (!res.ok) {
				const { error } = await res.json();
				showFeedback("ERROR", error ?? "발행에 실패했습니다.");
				return;
			}

			showFeedback("SUCCESS", "홈페이지가 발행되었습니다.");
			router.refresh();
		} finally {
			setIsPublishing(false);
		}
	}

	async function handleSaveSettings(): Promise<void> {
		setIsSavingSettings(true);
		try {
			const res = await fetch("/api/seller/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(settings),
			});

			if (!res.ok) {
				const { error } = await res.json();
				showFeedback("ERROR", error ?? "저장에 실패했습니다.");
				return;
			}

			showFeedback("SUCCESS", "거래 설정이 저장되었습니다.");
			router.refresh();
		} finally {
			setIsSavingSettings(false);
		}
	}

	return (
		<div className="space-y-5">
			<div className="flex gap-1 rounded-xl border border-[#E5E7EB] bg-white p-1">
				<button type="button" onClick={() => setTab("PAGE")} className={tabButton({ active: tab === "PAGE" })}>
					홈페이지
				</button>
				<button
					type="button"
					onClick={() => setTab("SETTINGS")}
					className={tabButton({ active: tab === "SETTINGS" })}>
					거래 설정
				</button>
			</div>

			{feedback && (
				<div className={feedbackBox({ kind: feedback.kind })}>
					{feedback.kind === "SUCCESS" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
					{feedback.message}
				</div>
			)}

			{tab === "SETTINGS" ? (
				<SiteBuilderTradeSettings
					company={data.company}
					settings={settings}
					isSaving={isSavingSettings}
					onChange={setSettings}
					onSave={handleSaveSettings}
				/>
			) : (
				<>
					<SiteBuilderToolbar
						publishState={resolvePublishState()}
						isPreview={isPreview}
						isSaving={isSaving}
						isPublishing={isPublishing}
						onTogglePreview={() => setIsPreview((prev) => !prev)}
						onSave={handleSave}
						onPublish={handlePublish}
					/>

					{data.isSeeded && (
						<div className="flex items-start gap-2.5 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
							<Sparkles size={15} className="mt-0.5 shrink-0 text-[#3B82F6]" />
							<p className="text-sm text-[#1D4ED8]">
								기존에 입력해 둔 기업 프로필 정보로 초안을 만들어 뒀어요. 내용을 확인하고 수정한 뒤
								저장해주세요. <span className="font-medium">저장하기 전까지는 반영되지 않습니다.</span>
							</p>
						</div>
					)}

					{isPreview ? (
						<SiteRenderer blocks={blocks} />
					) : (
						<>
							<div className="space-y-3">
								{blocks.map((block, index) => (
									<SiteBuilderBlockCard
										key={block.id}
										block={block}
										isFirst={index === 0}
										isLast={index === blocks.length - 1}
										isOpen={openBlockId === block.id}
										onToggle={() => setOpenBlockId(openBlockId === block.id ? null : block.id)}
										onChange={(next) =>
											updateBlocks(blocks.map((b) => (b.id === next.id ? next : b)))
										}
										onMove={(direction) => updateBlocks(moveBlock(blocks, index, direction))}
										onRemove={() => updateBlocks(blocks.filter((b) => b.id !== block.id))}
									/>
								))}

								{blocks.length === 0 && (
									<div className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 text-center">
										<p className="text-sm font-medium text-[#374151]">아직 블록이 없어요</p>
										<p className="mt-1 text-xs text-[#9CA3AF]">
											아래에서 블록을 추가해 홈페이지를 만들어보세요.
										</p>
									</div>
								)}
							</div>

							<SiteBuilderAddBlock onAdd={handleAddBlock} />
						</>
					)}
				</>
			)}
		</div>
	);
}
