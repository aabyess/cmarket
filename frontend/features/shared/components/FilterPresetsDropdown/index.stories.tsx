import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FilterPresetsDropdown } from "@/features/shared/components/FilterPresetsDropdown";
import type { FilterPreset } from "@/hooks/useFilterPresets";

const meta: Meta = {
	title: "Shared/FilterPresetsDropdown",
};

export default meta;
type Story = StoryObj;

type DemoValue = { keyword: string; sort: "newest" | "oldest" };

function FilterPresetsDropdownDemo(): React.ReactNode {
	const [currentValue, setCurrentValue] = useState<DemoValue>({ keyword: "", sort: "newest" });
	const [presets, setPresets] = useState<FilterPreset<DemoValue>[]>([
		{ id: "1", name: "최근 30일", value: { keyword: "", sort: "newest" } },
	]);

	return (
		<FilterPresetsDropdown<DemoValue>
			presets={presets}
			currentValue={currentValue}
			onApply={setCurrentValue}
			onSave={(name) =>
				setPresets((prev) => [...prev, { id: String(prev.length + 1), name, value: currentValue }])
			}
			onDelete={(id) => setPresets((prev) => prev.filter((preset) => preset.id !== id))}
		/>
	);
}

export const Default: Story = {
	render: () => <FilterPresetsDropdownDemo />,
};
