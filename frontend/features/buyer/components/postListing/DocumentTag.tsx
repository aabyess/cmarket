"use client";

interface DocumentTagProps {
	label: string;
	onRemove: () => void;
}

export default function DocumentTag({ label, onRemove }: DocumentTagProps) {
	return (
		<div className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
			<span>{label}</span>
			<button onClick={onRemove} className="hover:text-indigo-900 font-bold" aria-label="제거">
				×
			</button>
		</div>
	);
}