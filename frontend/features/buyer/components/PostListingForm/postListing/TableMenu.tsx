"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { Table, Rows3, Columns3, ArrowLeftRight, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";

type TableMenuProps = {
	editor: Editor;
};

export default function TableMenu({ editor }: TableMenuProps): React.ReactNode {
	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const isInTable = editor.isActive("table");

	useEffect(() => {
		function handleClickOutside(e: MouseEvent): void {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function run(action: () => void): void {
		action();
		setIsOpen(false);
	}

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className={cn(
					"flex size-7 items-center justify-center rounded transition-colors",
					isOpen || isInTable ? "bg-[#EFF6FF] text-imsg-blue" : "text-[#6B7280] hover:bg-[#F3F4F6]",
				)}
			>
				<Table size={15} />
			</button>

			{isOpen && (
				<div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1.5 shadow-lg">
					<MenuItem
						icon={Table}
						label="표 삽입 (3 × 3)"
						onClick={() =>
							run(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())
						}
					/>

					{isInTable && (
						<>
							<div className="my-1 h-px bg-[#F3F4F6]" />
							<MenuItem
								icon={Rows3}
								label="아래에 행 추가"
								onClick={() => run(() => editor.chain().focus().addRowAfter().run())}
							/>
							<MenuItem
								icon={Columns3}
								label="오른쪽에 열 추가"
								onClick={() => run(() => editor.chain().focus().addColumnAfter().run())}
							/>
							<MenuItem
								icon={ArrowLeftRight}
								label="머리글 행 전환"
								onClick={() => run(() => editor.chain().focus().toggleHeaderRow().run())}
							/>
							<div className="my-1 h-px bg-[#F3F4F6]" />
							<MenuItem
								icon={Trash2}
								label="행 삭제"
								danger
								onClick={() => run(() => editor.chain().focus().deleteRow().run())}
							/>
							<MenuItem
								icon={Trash2}
								label="열 삭제"
								danger
								onClick={() => run(() => editor.chain().focus().deleteColumn().run())}
							/>
							<MenuItem
								icon={Trash2}
								label="표 삭제"
								danger
								onClick={() => run(() => editor.chain().focus().deleteTable().run())}
							/>
						</>
					)}
				</div>
			)}
		</div>
	);
}

type MenuItemProps = {
	icon: React.ComponentType<{ size?: number }>;
	label: string;
	onClick: () => void;
	danger?: boolean;
};

function MenuItem({ icon: Icon, label, onClick, danger }: MenuItemProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-xs font-medium transition-colors",
				danger ? "text-[#DC2626] hover:bg-[#FEF2F2]" : "text-[#374151] hover:bg-[#F9FAFB]",
			)}
		>
			<Icon size={14} />
			{label}
		</button>
	);
}