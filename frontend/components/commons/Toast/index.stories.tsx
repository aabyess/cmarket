import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toast } from "@/components/commons/Toast";
import { useToastStore } from "@/store/useToastStore";

const meta: Meta<typeof Toast> = {
	title: "Commons/Toast",
	component: Toast,
};

export default meta;
type Story = StoryObj<typeof Toast>;

function ToastDemo(): React.ReactNode {
	const showToast = useToastStore((state) => state.showToast);

	return (
		<div className="flex gap-2">
			<button
				onClick={() => showToast("공고를 등록했어요")}
				className="bg-imsg-blue rounded-lg px-4 py-2 text-sm font-medium text-white">
				성공 토스트 띄우기
			</button>
			<button
				onClick={() => showToast("전송에 실패했어요", "error")}
				className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white">
				에러 토스트 띄우기
			</button>
			<Toast />
		</div>
	);
}

export const Default: Story = {
	render: () => <ToastDemo />,
};
