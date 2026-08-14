"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Strikethrough,
	List,
	ListOrdered,
	Quote,
	LinkIcon,
	Undo2,
	Redo2,
	ImageIcon,
	TableIcon,
	AlignLeft,
	AlignCenter,
	AlignRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import DescriptionLinkModal from "@/features/buyer/components/PostListingForm/postListing/DescriptionLinkModal";
import TableMenu from "@/features/buyer/components/PostListingForm/postListing/TableMenu";

const QUICK_PHRASES = [
	"샘플 요청 가능",
	"브랜드 무관",
	"동등 이상 사양 가능",
	"분할 납품 가능",
	"영문 매뉴얼/카탈로그 제공",
	"SNI 인증 필요",
	"MSDS 서류 필요",
	"할랄 인증 필요",
	"220V 사용 가능 제품",
	"FOB/CIF 조건 협의 가능",
];

type ListingDescriptionEditorProps = {
	value: string;
	onChange: (html: string) => void;
};

export default function ListingDescriptionEditor({ value, onChange }: ListingDescriptionEditorProps) {
	const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link.configure({ openOnClick: false }),
			Placeholder.configure({ placeholder: "용도, 품질 기준, 참고사항 등을 자유롭게 적어주세요" }),
			Image,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Table.configure({ resizable: true }),
			TableRow,
			TableHeader,
			TableCell,
		],
		content: value,
		onUpdate: ({ editor }) => onChange(editor.getHTML()),
		immediatelyRender: false,
	});

	function insertPhrase(phrase: string): void {
		editor?.chain().focus("end").insertContent(`<p>${phrase}</p>`).run();
	}

	function handleLinkSubmit(url: string): void {
		editor?.chain().focus().setLink({ href: url }).run();
	}

	async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file || !editor) return;

		if (file.size > 5 * 1024 * 1024) {
			alert("파일 크기는 5MB를 초과할 수 없습니다.");
			return;
		}

		setIsUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch("/api/buyer/upload-description-image", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const { error } = await res.json();
				throw new Error(error);
			}

			const { url } = await res.json();
			editor.chain().focus().setImage({ src: url }).run();
		} catch (err) {
			console.error(err);
			alert("이미지 업로드에 실패했습니다.");
		} finally {
			setIsUploading(false);
		}
	}

	if (!editor) return null;

	return (
		<div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
			{/* 툴바 */}
			<div className="flex flex-wrap items-center gap-0.5 border-b border-[#E2E8F0] bg-[#F9FAFB] px-2 py-1.5">
				<ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo2} />
				<ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo2} />
				<div className="mx-1 h-5 w-px bg-[#E5E7EB]" />
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBold().run()}
					icon={Bold}
					isActive={editor.isActive("bold")}
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleItalic().run()}
					icon={Italic}
					isActive={editor.isActive("italic")}
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					icon={UnderlineIcon}
					isActive={editor.isActive("underline")}
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleStrike().run()}
					icon={Strikethrough}
					isActive={editor.isActive("strike")}
				/>
				<div className="mx-1 h-5 w-px bg-[#E5E7EB]" />
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					icon={AlignLeft}
					isActive={editor.isActive({ textAlign: "left" })}
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					icon={AlignCenter}
					isActive={editor.isActive({ textAlign: "center" })}
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					icon={AlignRight}
					isActive={editor.isActive({ textAlign: "right" })}
				/>
				<div className="mx-1 h-5 w-px bg-[#E5E7EB]" />
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					icon={List}
					isActive={editor.isActive("bulletList")}
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					icon={ListOrdered}
					isActive={editor.isActive("orderedList")}
				/>
				<ToolbarButton
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					icon={Quote}
					isActive={editor.isActive("blockquote")}
				/>
				<div className="mx-1 h-5 w-px bg-[#E5E7EB]" />
				<ToolbarButton onClick={() => setIsLinkModalOpen(true)} icon={LinkIcon} isActive={editor.isActive("link")} />
				<ToolbarButton
					onClick={() => fileInputRef.current?.click()}
					icon={ImageIcon}
					disabled={isUploading}
				/>
				<TableMenu editor={editor} />
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				className="hidden"
				onChange={handleImageSelect}
			/>

			{/* 본문 */}
			<EditorContent
				editor={editor}
				className="prose prose-sm max-w-none px-4 py-3 text-sm text-[#374151] focus:outline-none [&_.ProseMirror]:min-h-[140px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p:last-child]:mb-0 [&_.ProseMirror_table]:w-full [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-[#E2E8F0] [&_.ProseMirror_td]:p-2 [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-[#E2E8F0] [&_.ProseMirror_th]:bg-[#F9FAFB] [&_.ProseMirror_th]:p-2 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[#9CA3AF] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
			/>

			{/* 자주 쓰이는 문구 */}
			<div className="border-t border-[#E2E8F0] bg-[#F9FAFB] px-4 py-3">
				<p className="mb-2 text-xs font-medium text-[#9CA3AF]">자주 쓰이는 문구</p>
				<div className="flex flex-wrap gap-1.5">
					{QUICK_PHRASES.map((phrase) => (
						<button
							key={phrase}
							type="button"
							onClick={() => insertPhrase(phrase)}
							className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition-colors hover:border-imsg-blue hover:text-imsg-blue"
						>
							+ {phrase}
						</button>
					))}
				</div>
			</div>

			<DescriptionLinkModal
				isOpen={isLinkModalOpen}
				onClose={() => setIsLinkModalOpen(false)}
				onSubmit={handleLinkSubmit}
			/>
		</div>
	);
}

type ToolbarButtonProps = {
	onClick: () => void;
	icon: React.ComponentType<{ size?: number }>;
	isActive?: boolean;
	disabled?: boolean;
};

function ToolbarButton({ onClick, icon: Icon, isActive, disabled }: ToolbarButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"flex size-8 items-center justify-center rounded transition-colors disabled:opacity-40",
				isActive ? "bg-[#EFF6FF] text-imsg-blue" : "text-[#6B7280] hover:bg-[#F3F4F6]",
			)}
		>
			<Icon size={18} />
		</button>
	);
}