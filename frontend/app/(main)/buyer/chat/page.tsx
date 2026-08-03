import { MessageSquare } from "lucide-react";

export default function BuyerChatPage() {
	return (
		<div className="flex h-full flex-col items-center justify-center bg-[#F0F5FF]">
			<div className="mb-3 flex size-14 items-center justify-center rounded-full bg-white">
				<MessageSquare size={26} className="text-[#9CA3AF]" />
			</div>
			<p className="text-[15px] font-medium text-[#1F2937]">대화를 선택하세요</p>
			<p className="mt-1 text-sm text-[#6B7280]">
				왼쪽 목록에서 공급기업을 선택하면 대화를 시작할 수 있어요.
			</p>
		</div>
	);
}