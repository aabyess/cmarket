import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "@/components/commons/Pagination";

const meta: Meta<typeof Pagination> = {
	title: "Commons/Pagination",
	component: Pagination,
};

export default meta;
type Story = StoryObj<typeof Pagination>;

function PaginationDemo() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);

	return (
		<Pagination
			page={page}
			pageCount={5}
			pageSize={pageSize}
			onPageChange={setPage}
			onPageSizeChange={setPageSize}
		/>
	);
}

export const Default: Story = {
	render: () => <PaginationDemo />,
};