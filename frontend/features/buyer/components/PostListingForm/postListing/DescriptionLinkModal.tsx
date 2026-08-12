"use client";

import { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

type DescriptionLinkModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (url: string) => void;
};

export default function DescriptionLinkModal({ isOpen, onClose, onSubmit }: DescriptionLinkModalProps) {
	const [url, setUrl] = useState("");

	function handleSubmit(): void {
		const trimmed = url.trim();
		if (!trimmed) return;
		onSubmit(trimmed);
		setUrl("");
		onClose();
	}

	function handleClose(): void {
		setUrl("");
		onClose();
	}

	return (
		<Dialog open={isOpen} onClose={handleClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />
			<div className="fixed inset-0 flex items-center justify-center p-4">
				<DialogPanel className="w-full max-w-sm rounded-2xl bg-white p-5">
					<DialogTitle className="text-sm font-semibold text-[#1F2937]">링크 삽입</DialogTitle>
					<input
						type="text"
						autoFocus
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSubmit();
						}}
						placeholder="https://example.com"
						className="mt-3 w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
					/>
					<div className="mt-4 flex justify-end gap-2">
						<button
							onClick={handleClose}
							className="rounded-lg px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6]"
						>
							취소
						</button>
						<button
							onClick={handleSubmit}
							disabled={!url.trim()}
							className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
						>
							삽입
						</button>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
}