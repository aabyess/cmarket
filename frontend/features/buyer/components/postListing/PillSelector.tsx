"use client";

interface Item {
	id: string;
	label: string;
}

interface PillSelectorProps {
	items: Item[];
	selectedIds: string[];
	onChange: (selectedIds: string[]) => void;
}

export default function PillSelector({ items, selectedIds, onChange }: PillSelectorProps) {
	const handleToggle = (id: string) => {
		const updated = selectedIds.includes(id)
			? selectedIds.filter((sid) => sid !== id)
			: [...selectedIds, id];
		onChange(updated);
	};

	return (
		<div className="flex flex-wrap gap-3">
			{items.map((item) => (
				<button
					key={item.id}
					onClick={() => handleToggle(item.id)}
					className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
						selectedIds.includes(item.id)
							? "bg-[#1B3A6B] text-white shadow-md"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}>
					{item.label}
				</button>
			))}
		</div>
	);
}